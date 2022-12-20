import { useContext, useEffect, useRef } from "react";

import { DataContext } from "../components/context/DataContext";
import { SocketContext } from "../components/context/SocketContext";

export default function useSocket() {
  const { groupData, setGroupData } = useContext(DataContext);
  const { socket } = useContext(SocketContext);
  const SOCKET_TIMEOUT = 10000;
  // const AWAY_TIMEOUT = 180000; // 3 minutes
  const AWAY_TIMEOUT = 5000; // 3 minutes

  // stale closure fix
  const socketRef = useRef(socket);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // timers
  const mouseMoveTimerRef = useRef(null);
  const awayTimerRef = useRef(null);

  // update the server on user status change
  function statusUpdater() {
    function emitStatus(params) {
      const { status } = params;
      const validStatuses = ["online", "away", "busy", "offline"];
      let effectiveSocket;

      // function statusChangeAcknowledged(res) {
      //   console.log(res);
      //   localStorage.setItem("userStatus", res.change);
      // }

      if (!validStatuses.includes(status))
        throw new Error("invalid status parameter");

      if (socket) effectiveSocket = socket;
      else if (socketRef.current) {
        effectiveSocket = socketRef.current;
      } else {
        console.warn("socket not ready");
        return null;
      }

      effectiveSocket.emit("statusChange", { status });
      // effectiveSocket.emit("statusChange", { status }, (res) => {
      //   if (res) statusChangeAcknowledged(res);
      // });
    }

    function setAwayTimeout() {
      awayTimerRef.current = setTimeout(() => {
        console.log("AWAY");
        emitStatus({ status: "away" });
        mouseMoveTimerRef.current = null;
      }, AWAY_TIMEOUT);
    }

    // if timer is not set, set it
    if (!mouseMoveTimerRef?.current) {
      console.log("ONLINE");
      emitStatus({ status: "online" });
      mouseMoveTimerRef.current = Date.now();
      setAwayTimeout();
    }

    // throttler, if time passed since last scroll evt <250ms ignore and reset away timer
    else if (Date.now() - mouseMoveTimerRef.current < 100) {
      mouseMoveTimerRef.current = Date.now();
      clearTimeout(awayTimerRef.current);
      setAwayTimeout();
    }
  }

  function sendMessage(args) {
    const { message, target, failed } = args;
    const genesisCluster = { target, data: message };
    const pendingCluster = {
      sender: {
        username: localStorage.username,
        userImage: {
          thumbnailMedium: localStorage.userImageMedium,
        },
      },
      channel: {},
      content: [genesisCluster.data],
      clusterTimestamp: message.timestamp,
    };

    // push unsaved, non-failed cluster to message stack, failed messages property gets reset to null on retry
    setGroupData((prevStack) => {
      const dataCopy = { ...prevStack };
      const stackCopy = [...dataCopy[target.group].chatData[target.channel]];

      if (!failed) stackCopy.push(pendingCluster);
      else {
        const clusterIndex = stackCopy.findIndex(
          (cluster) => cluster.clusterTimestamp === message.timestamp
        );

        stackCopy[clusterIndex].content[0].failed = null;
      }

      dataCopy[target.group].chatData[target.channel] = stackCopy;

      return dataCopy;
    });

    function genesisAcknowledged(res) {
      setGroupData((prevStack) => {
        // setState expression is used to access the latest pending state before rerender
        // spread so that the values instead of the pointer is referenced by the new variable
        // else state will see no change since the pointer doesn't change even if the values did
        // make a copy of the whole chatData and the specific chat being modified
        const dataCopy = { ...prevStack };
        const stackCopy = [
          ...dataCopy[res.target.group].chatData[res.target.channel],
        ];

        const clusterIndex = stackCopy.findIndex(
          (message) => message.clusterTimestamp === res.data.clusterTimestamp
        );

        const contentCopy = stackCopy[clusterIndex].content;

        contentCopy[0] = res.data.content[0];

        // copy and move previous content with acknowledged content added
        stackCopy[clusterIndex] = res.data;
        stackCopy[clusterIndex].content = contentCopy;

        dataCopy[res.target.group].chatData[res.target.channel] = stackCopy;

        return dataCopy;
      });
    }

    function genesisTimedOut() {
      setGroupData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = [...dataCopy[target.group].chatData[target.channel]];

        const clusterIndex = stackCopy.findIndex(
          (message) =>
            message.clusterTimestamp === pendingCluster.clusterTimestamp
        );

        stackCopy[clusterIndex].content[0].failed = {
          // was just setting {failed = res} here, that results in a circular reference that fails json.stringify in emit method
          message: { ...message },
          target: { ...target },
          status: true,
        };

        dataCopy[target.group].chatData[target.channel] = stackCopy;

        return dataCopy;
      });
    }

    // console.log(JSON.stringify(genesisCluster)); // emit fails with arg as failed object as it is a circular reference, fix by spread or reassigning

    socket
      .timeout(SOCKET_TIMEOUT)
      .emit("newCluster", { ...genesisCluster }, (err, res) => {
        // set failed property on message if timed out or error
        if (err) genesisTimedOut();
        else genesisAcknowledged(res);
      });
  }

  function appendMessage(args) {
    const { message, parent, target, failed } = args;

    // create an object with necessary info to send to api
    const appendObject = {
      target: {
        cluster: {
          timestamp: parent.clusterTimestamp ? parent.clusterTimestamp : null,
          id: parent._id ? parent._id : null,
        },
        group: target.group,
        channel: target.channel,
      },
      content: { ...message },
    };

    // find the index of the parent to be append locally,
    let clusterIndex;
    if (appendObject.target.cluster.id) {
      clusterIndex = groupData[target.group].chatData[target.channel].findIndex(
        (cluster) => cluster._id === appendObject.target.cluster.id
      );
    } else {
      clusterIndex = groupData[target.group].chatData[target.channel].findIndex(
        (cluster) =>
          cluster.clusterTimestamp === appendObject.target.cluster.timestamp
      );
    }

    // find index of pending message
    let pendingIndex;
    if (!failed) {
      pendingIndex =
        groupData[target.group].chatData[target.channel][clusterIndex].content
          .length;
    } else {
      pendingIndex = groupData[target.group].chatData[target.channel][
        clusterIndex
      ].content.findIndex((content) => content.timestamp === message.timestamp);
    }

    appendObject.target.index = pendingIndex; // index of message in cluster for backend parity

    // update local data with temporary data, if is a retry, reset failed property
    setGroupData((prevStack) => {
      const dataCopy = { ...prevStack };

      if (!failed) {
        const updatedCluster =
          dataCopy[target.group].chatData[target.channel][clusterIndex];
        updatedCluster.content.push(message);

        dataCopy[target.group].chatData[target.channel][clusterIndex] =
          updatedCluster;
      } else {
        dataCopy[target.group].chatData[target.channel][clusterIndex].content[
          pendingIndex
        ].failed = null;
      }

      return dataCopy;
    });

    function appendAcknowledged(res) {
      setGroupData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = [
          ...prevStack[res.target.group].chatData[res.target.channel],
        ];

        const clusterIndex = stackCopy.findIndex(
          (cluster) => cluster.id === res.target.cluster.id
        );

        // find pending message
        const messageIndex = stackCopy[clusterIndex].content.findIndex(
          (message) =>
            message.timestamp === (res.err ? res.err : res.data.timestamp)
        ); // index always 0 because ternary and operator precedence, use parentheses to eval right side first

        dataCopy[res.target.group].chatData[res.target.channel][
          clusterIndex
        ].content[messageIndex] = res.data;

        return dataCopy;
      });
    }

    function appendTimedOut() {
      setGroupData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = [...prevStack[target.group].chatData[target.channel]];

        const clusterIndex = stackCopy.findIndex(
          (cluster) =>
            cluster.clusterTimestamp === appendObject.target.cluster.timestamp
        );

        dataCopy[target.group].chatData[target.channel][clusterIndex].content[
          appendObject.target.index
        ].failed = {
          message: { ...message },
          parent: { ...parent },
          target: { ...target },
          status: true,
        };

        return dataCopy;
      });
    }

    socket
      .timeout(SOCKET_TIMEOUT)
      .emit("appendCluster", appendObject, (err, res) => {
        if (err || res.failed)
          appendTimedOut(); // handle err if append fails on backend with res.failed in addition to timeout
        else appendAcknowledged(res);
      });
  }

  function fetchMore(fetchParams) {
    function patchChat(params) {
      const { partialChat, target, depleted = false } = params;

      setGroupData((prevData) => {
        const dataCopy = { ...prevData };
        const groupCopy = { ...dataCopy[target.group] };
        const stackCopy = [...groupCopy.chatData[target.channel]];

        groupCopy.chatData[target.channel] = [...partialChat, ...stackCopy];
        if (depleted) {
          groupCopy.chatDepleted[target.channel] = true;
        }

        dataCopy[target.group] = groupCopy;

        return dataCopy;
      });
    }

    function fetchReceived(res) {
      patchChat({
        partialChat: res.data,
        target: res.target,
        depleted: res.depleted,
      });
    }

    return new Promise((resolve, reject) => {
      resolve(
        socket
          .timeout(SOCKET_TIMEOUT)
          .emit("fetchMore", fetchParams, (err, res) => {
            if (err || res.failed) return { err: "timed out" };
            else fetchReceived(res);
          })
      );
    });
  }

  return {
    sendMessage,
    appendMessage,
    fetchMore,
    statusUpdater,
  };
}
