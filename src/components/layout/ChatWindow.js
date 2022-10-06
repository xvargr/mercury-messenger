import { useEffect, useMemo, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
// components
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
import Sender from "../chat/SenderWrapper";
import Message from "../chat/Message";
// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
import { ChatSkeletonLoader } from "../ui/SkeletonLoaders";
import { SocketContext } from "../context/SocketContext";

function ChatWindow() {
  const { channel } = useParams();
  const { groupMounted, chatData, setChatData } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { socket } = useContext(SocketContext);
  const endStopRef = useRef();
  const thisChatStack = useMemo(() => {
    return chatData ? chatData[selectedGroup._id][selectedChannel._id] : [];
  }, [chatData, selectedGroup, selectedChannel]);

  useEffect(() => {
    // scroll to bottom on every new message
    if (endStopRef.current) {
      endStopRef.current.scrollIntoView();
    }
  }, [chatData]);

  function sendOut(messageData) {
    const elapsed =
      thisChatStack.length > 0
        ? Date.now() - thisChatStack[thisChatStack.length - 1].clusterTimestamp
        : 0;

    const lastSender =
      thisChatStack.length > 0
        ? thisChatStack[thisChatStack.length - 1].sender.username
        : null;

    const lastCluster =
      thisChatStack.length > 0 ? thisChatStack[thisChatStack.length - 1] : null;

    // new cluster if last message is more than 1 min ago or someone else messaged since
    if (elapsed > 60000 || lastSender !== localStorage.username) {
      const genesisCluster = {
        target: { group: selectedGroup._id, channel: selectedChannel._id },
        data: messageData,
      };

      const pendingCluster = {
        sender: {
          username: localStorage.username,
          userImage: {
            thumbnailMedium: localStorage.userImageMedium,
          },
        },
        channel: {},
        content: [genesisCluster.data],
        clusterTimestamp: messageData.timestamp,
      };

      // ! don't use selected context
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        dataCopy[selectedGroup._id][selectedChannel._id].push(pendingCluster);
        return dataCopy;
      });

      function clusterAcknowledged(res) {
        setChatData((prevStack) => {
          // setState callback is used to access the latest pending state before rerender
          // spread so that the values instead of the pointer is referenced by the new variable
          // else state will see no change since the pointer doesn't change even if the values did
          // make a copy of the whole chatData and the specific chat being modified
          const dataCopy = { ...prevStack };
          const stackCopy = [
            ...prevStack[res.target.group][res.target.channel],
          ];

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

      socket.emit("newCluster", genesisCluster, (res) => {
        clusterAcknowledged(res);
      });
    } else if (elapsed < 60000 && lastSender === localStorage.username) {
      // create an object with necessary info to send to api
      const appendObject = {
        target: {
          cluster: {
            timestamp: lastCluster.clusterTimestamp
              ? lastCluster.clusterTimestamp
              : null,
            id: lastCluster._id ? lastCluster._id : null,
          },
          group: selectedGroup._id,
          channel: selectedChannel._id,
        },
        content: { ...messageData },
      };

      // find the index of the message to be append locally,
      let clusterIndex;
      if (appendObject.target.cluster.id) {
        clusterIndex = chatData[selectedGroup._id][
          selectedChannel._id
        ].findIndex(
          (cluster) => cluster._id === appendObject.target.cluster.id
        );
      } else {
        clusterIndex = chatData[selectedGroup._id][
          selectedChannel._id
        ].findIndex(
          (cluster) =>
            cluster.clusterTimestamp === appendObject.target.cluster.timestamp
        );
      }

      // find index of pending message
      const pendingIndex = thisChatStack[clusterIndex].content.length;

      appendObject.target.index = pendingIndex; // for sort verification

      // update local data with temporary data
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };

        const updatedCluster =
          dataCopy[selectedGroup._id][selectedChannel._id][clusterIndex];
        updatedCluster.content.push(messageData);

        dataCopy[selectedGroup._id][selectedChannel._id][clusterIndex] =
          updatedCluster;

        return dataCopy;
      });

      function appendAcknowledged(res) {
        setChatData((prevStack) => {
          const dataCopy = { ...prevStack };
          const stackCopy = [
            ...prevStack[res.target.group][res.target.channel],
          ];

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

      // send append info to api
      socket.emit("appendCluster", appendObject, (res) =>
        appendAcknowledged(res)
      );
    }
  }

  // todo set up intervals to rerender, for updated timestamp display

  function renderClusters(stack) {
    const clusterStack = [];

    function renderMessages(content) {
      const messageStack = [];
      // todo support content other than text
      // todo support failed status
      content.forEach((message) => {
        // some messages can be null if asynchronously saved, so check
        if (message) {
          messageStack.push(
            <Message
              key={message.timestamp}
              timestamp={message.timestamp}
              pending={message._id ? false : true}
            >
              {message.text}
            </Message>
          );
        }
      });
      return messageStack;
    }

    stack.forEach((cluster) => {
      clusterStack.push(
        <Sender
          sender={cluster.sender}
          timestamp={cluster.clusterTimestamp}
          key={cluster.clusterTimestamp}
          pending={cluster._id ? false : true}
        >
          {renderMessages(cluster.content)}
        </Sender>
      );
    });
    return clusterStack;
  }

  if (!groupMounted || !chatData) {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={channel} />

        <div className="w-full flex-grow overflow-y-hidden">
          <ChatSkeletonLoader count={15} />

          <ChatInputBox return={null} />
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={selectedChannel.name} />

        <div className="w-full flex-grow overflow-y-scroll scrollbar-dark scroll-smooth">
          {renderClusters(thisChatStack)}
          <div className="w-full h-28" ref={endStopRef}></div>
          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  }
}

export default ChatWindow;
