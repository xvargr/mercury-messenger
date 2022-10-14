import { useContext } from "react";

import { DataContext } from "../components/context/DataContext";
import { SocketContext } from "../components/context/SocketContext";

export default function useSocket() {
  const { chatData, setChatData } = useContext(DataContext);
  const { socket } = useContext(SocketContext);
  const timeoutDuration = 5000;

  function sendMessage(args) {
    const { message, target } = args;
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

    // ! retry is pushed again and duplicated, no fails after
    setChatData((prevStack) => {
      const dataCopy = { ...prevStack };
      dataCopy[target.group][target.channel].push(pendingCluster);
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
          message: { ...message },
          target: { ...target },
        };

        return dataCopy;
      });
    }

    console.log(JSON.stringify(genesisCluster)); // ! retries with arg as failed object fails as it is a circular reference
    // console.log(args);
    // const babe = { ...genesisCluster };
    // console.log(JSON.stringify(babe));

    socket
      .timeout(timeoutDuration)
      .emit("newCluster", { ...genesisCluster }, (err, res) => {
        // set failed property on message if timed out or error
        if (err) genesisTimedOut();
        else genesisAcknowledged(res);
      });
  }

  function appendMessage(args) {
    const { message, parent, target } = args;

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
    const pendingIndex =
      chatData[target.group][target.channel][clusterIndex].content.length;

    appendObject.target.index = pendingIndex; // index of message in cluster for backend parity

    // update local data with temporary data
    setChatData((prevStack) => {
      const dataCopy = { ...prevStack };

      const updatedCluster =
        dataCopy[target.group][target.channel][clusterIndex];
      updatedCluster.content.push(message);

      dataCopy[target.group][target.channel][clusterIndex] = updatedCluster;

      return dataCopy;
    });

    function appendAcknowledged(res) {
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
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = [...prevStack[target.group][target.channel]];

        const clusterIndex = stackCopy.findIndex(
          (cluster) =>
            cluster.clusterTimestamp === appendObject.target.cluster.timestamp
        );

        dataCopy[target.group][target.channel][clusterIndex].content[
          appendObject.target.index
        ].failed = { ...message, ...parent, ...target };

        return dataCopy;
      });
    }

    socket
      .timeout(timeoutDuration)
      .emit("appendCluster", appendObject, (err, res) => {
        if (err) appendTimedOut();
        else appendAcknowledged(res);
      });
  }

  return {
    sendMessage,
    appendMessage,
  };
}
