import { useContext } from "react";

import { DataContext } from "../components/context/DataContext";
import { SocketContext } from "../components/context/SocketContext";

export default function useSocket() {
  const { chatData, setChatData } = useContext(DataContext);
  const { socket } = useContext(SocketContext);
  const timeoutDuration = 7000;

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
    setChatData((prevStack) => {
      const dataCopy = { ...prevStack };

      if (!failed) dataCopy[target.group][target.channel].push(pendingCluster);
      else {
        const clusterIndex = dataCopy[target.group][target.channel].findIndex(
          (cluster) => cluster.clusterTimestamp === message.timestamp
        );

        dataCopy[target.group][target.channel][clusterIndex].content[0].failed =
          null;
      }

      return dataCopy;
    });

    function genesisAcknowledged(res) {
      setChatData((prevStack) => {
        // setState callback is used to access the latest pending state before rerender
        // spread so that the values instead of the pointer is referenced by the new variable
        // else state will see no change since the pointer doesn't change even if the values did
        // make a copy of the whole chatData and the specific chat being modified
        const dataCopy = { ...prevStack };
        const stackCopy = [...prevStack[res.target.group][res.target.channel]];

        const index = stackCopy.findIndex(
          (message) => message.clusterTimestamp === res.data.clusterTimestamp
        );

        const contentCopy =
          dataCopy[res.target.group][res.target.channel][index].content;

        contentCopy[0] = res.data.content[0];

        dataCopy[res.target.group][res.target.channel][index] = res.data;
        dataCopy[res.target.group][res.target.channel][index].content =
          contentCopy;

        return dataCopy;
      });
    }

    function genesisTimedOut() {
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = [...prevStack[target.group][target.channel]];

        const index = stackCopy.findIndex(
          (message) =>
            message.clusterTimestamp === pendingCluster.clusterTimestamp
        );

        dataCopy[target.group][target.channel][index].content[0].failed = {
          // was just setting {failed = res} here, that results in a circular reference that fails json.stringify in emit method
          message: { ...message },
          target: { ...target },
          status: true,
        };

        return dataCopy;
      });
    }

    // console.log(JSON.stringify(genesisCluster)); // emit fails with arg as failed object as it is a circular reference, fix by spread or reassigning

    socket
      .timeout(timeoutDuration)
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
      clusterIndex = chatData[target.group][target.channel].findIndex(
        (cluster) => cluster._id === appendObject.target.cluster.id
      );
    } else {
      clusterIndex = chatData[target.group][target.channel].findIndex(
        (cluster) =>
          cluster.clusterTimestamp === appendObject.target.cluster.timestamp
      );
    }

    // find index of pending message
    let pendingIndex;
    if (!failed) {
      pendingIndex =
        chatData[target.group][target.channel][clusterIndex].content.length;
    } else {
      pendingIndex = chatData[target.group][target.channel][
        clusterIndex
      ].content.findIndex((content) => content.timestamp === message.timestamp);
    }

    appendObject.target.index = pendingIndex; // index of message in cluster for backend parity

    // update local data with temporary data, if is a retry, reset failed property
    setChatData((prevStack) => {
      const dataCopy = { ...prevStack };

      if (!failed) {
        const updatedCluster =
          dataCopy[target.group][target.channel][clusterIndex];
        updatedCluster.content.push(message);

        dataCopy[target.group][target.channel][clusterIndex] = updatedCluster;
      } else {
        dataCopy[target.group][target.channel][clusterIndex].content[
          pendingIndex
        ].failed = null;
      }

      return dataCopy;
    });

    function appendAcknowledged(res) {
      console.log("appendAcknowledged");
      console.log(res);
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = [...prevStack[res.target.group][res.target.channel]];

        const clusterIndex = stackCopy.findIndex(
          (cluster) => cluster.id === res.target.cluster.id
        );

        // find pending message
        let messageIndex = stackCopy[clusterIndex].content.findIndex(
          (message) =>
            message.timestamp === (res.err ? res.err : res.data.timestamp)
        ); // index always 0 because ternary and operator precedence, use parentheses to eval right side first

        dataCopy[res.target.group][res.target.channel][clusterIndex].content[
          messageIndex
        ] = res.data;

        return dataCopy;
      });
    }

    function appendTimedOut() {
      console.log("appendTimedOut");
      // console.log(res)
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = [...prevStack[target.group][target.channel]];

        const clusterIndex = stackCopy.findIndex(
          (cluster) =>
            cluster.clusterTimestamp === appendObject.target.cluster.timestamp
        );

        dataCopy[target.group][target.channel][clusterIndex].content[
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
      .timeout(timeoutDuration)
      .emit("appendCluster", appendObject, (err, res) => {
        console.log("err", err);
        console.log("res", res); // ! sometimes api sends failed to save as res instead of err
        if (err || res.failed)
          appendTimedOut(); // ? append fails and responded so is still considered a response, not err
        else appendAcknowledged(res);
      });
  }

  // todo
  // test messages and retries on multiple clients
  // one instance of user connection only
  // move to own file and cleanup/refactoring
  // reconnection modal

  return {
    sendMessage,
    appendMessage,
  };
}
