import { useEffect, useState, useRef, useContext } from "react";
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
  const [chatStack, setChatStack] = useState([]);
  const endStopRef = useRef();

  // if (selectedChannel)
  //   console.log(`CHAT RERENDERED FOR ${selectedChannel.name}`);
  // console.log(chatStack);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // update the local chat stack on main chat data update
    if (groupMounted) {
      // console.log(
      //   "chatData",
      //   chatData[selectedGroup._id][selectedChannel._id].length
      // );
      setChatStack(chatData[selectedGroup._id][selectedChannel._id]);
    }
  });

  useEffect(() => {
    // scroll to bottom on every new message
    if (endStopRef.current) endStopRef.current.scrollIntoView();
  }, [chatStack]);

  function sendOut(messageData) {
    const elapsed =
      chatStack.length > 0
        ? Date.now() - chatStack[chatStack.length - 1].clusterTimestamp
        : 0;

    const lastSender =
      chatStack.length > 0
        ? chatStack[chatStack.length - 1].sender.username
        : null;

    const lastCluster =
      chatStack.length > 0 ? chatStack[chatStack.length - 1] : null;

    // console.log("elapsed: ", elapsed);
    // console.log("lastSender", lastSender);

    // new cluster if last message is more than 1 min ago or someone else messaged since
    if (elapsed > 60000 || lastSender !== localStorage.username) {
      const genesisCluster = {
        senderId: localStorage.userId,
        target: { group: selectedGroup._id, channel: selectedChannel._id },
        content: messageData,
      };

      // ? no id marks this as a pending mesasge
      const pendingCluster = {
        sender: {
          username: localStorage.username,
          userImage: {
            thumbnailMedium: localStorage.userImageMedium,
          },
        },
        channel: {},
        content: [genesisCluster.content],
        clusterTimestamp: messageData.timestamp,
      };

      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        dataCopy[selectedGroup._id][selectedChannel._id].push(pendingCluster);
        return dataCopy;
      });

      function clusterAcknowledged(res) {
        console.log(res);
        setChatData((prevStack) => {
          // setState callback is used to access the latest pending state before rerender
          // spread so that the values instead of the pointer is referenced by the new variable
          // else state will see no change since the pointer doesn't change even if the values did
          // make a copy of the whole chatData and the specific chat being modified
          const dataCopy = { ...prevStack };
          const stackCopy = [
            ...prevStack[selectedGroup._id][selectedChannel._id],
          ];
          const index = stackCopy.findIndex(
            (message) => message.clusterTimestamp === res.clusterTimestamp
          );
          // replace the pending message object with the finalized one
          stackCopy[index] = res;
          dataCopy[selectedGroup._id][selectedChannel._id] = stackCopy;

          return dataCopy;
        });
      }

      socket.emit("newCluster", genesisCluster, (res) => {
        clusterAcknowledged(res);
      });
    } else if (elapsed < 60000 && lastSender === localStorage.username) {
      // create an object with necessary info to send to api
      const appendObject = {
        clusterTimestamp: lastCluster.clusterTimestamp
          ? lastCluster.clusterTimestamp
          : null,
        clusterId: lastCluster._id ? lastCluster._id : null,
        ...messageData,
      };

      // find the index of the message to be append,
      // use id if verified, else use timestamp
      let clusterIndex;
      if (appendObject.clusterId) {
        clusterIndex = chatData[selectedGroup._id][
          selectedChannel._id
        ].findIndex((cluster) => cluster._id === appendObject.clusterId);
      } else {
        clusterIndex = chatData[selectedGroup._id][
          selectedChannel._id
        ].findIndex(
          (cluster) =>
            cluster.clusterTimestamp === appendObject.clusterTimestamp
        );
      }

      // update local data
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
        console.log(res); // ! here
        // setChatData((prevStack) => {
        //   const dataCopy = { ...prevStack };
        //   const stackCopy = [
        //     ...prevStack[selectedGroup._id][selectedChannel._id],
        //   ];
        //   const index = stackCopy.findIndex(
        //     (message) => message.clusterTimestamp === res.clusterTimestamp
        //   );
        //   // replace the pending message object with the finalized one
        //   stackCopy[index] = res;
        //   dataCopy[selectedGroup._id][selectedChannel._id] = stackCopy;

        //   return dataCopy;
        // });
      }

      // send append info to api
      socket.emit("appendCluster", appendObject, (res) =>
        appendAcknowledged(res)
      );
    }
  }

  // todo set up intervals to rerender, for updated timestamp display

  // console.log(socket);

  function renderMessages(stack) {
    // console.log("stack to render: ", stack);
    const renderedStack = [];

    function renderContent(content) {
      const renderedContent = [];
      // todo support content other than text
      content.forEach((content) => {
        renderedContent.push(
          <Message
            key={content.timestamp}
            timestamp={content.timestamp}
            pending={content._id ? false : true}
          >
            {content.text}
          </Message>
        );
      });
      return renderedContent;
    }

    stack.forEach((message) => {
      renderedStack.push(
        <Sender
          sender={message.sender}
          timestamp={message.clusterTimestamp}
          key={message.clusterTimestamp}
          pending={message._id ? false : true}
        >
          {renderContent(message.content)}
        </Sender>
      );
    });
    return renderedStack;
  }

  if (!groupMounted) {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={channel} />

        <div className="w-full flex-grow overflow-y-hidden">
          <ChatSkeletonLoader count={15} />

          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={selectedChannel.name} />

        <div className="w-full flex-grow overflow-y-scroll scrollbar-dark scroll-smooth">
          {renderMessages(chatStack)}
          <div className="w-full h-24" ref={endStopRef}></div>
          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  }
}

export default ChatWindow;
