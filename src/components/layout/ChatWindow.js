import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
// components
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
import { Sender, Pending } from "../chat/SenderWrapper";
import Message from "../chat/Message";
// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
import { ChatSkeletonLoader } from "../ui/SkeletonLoaders";
import { SocketContext } from "../context/SocketContext";

function ChatWindow() {
  const { channel } = useParams();
  const { groupMounted } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { socket } = useContext(SocketContext);
  const [chatStack, setChatStack] = useState([]);
  const endStopRef = useRef();

  useEffect(() => {
    // scroll to bottom on every new message
    if (endStopRef.current) endStopRef.current.scrollIntoView();
  }, [chatStack]);

  console.log("RERENDERED");
  console.log("chatStack: ", chatStack);

  // todo dynamic send new message or update if less than 1 min

  function sendOut(messageData) {
    // ? checks: under a minute, no other users sent a message
    const elapsed =
      chatStack.length > 0
        ? Date.now() - chatStack[chatStack.length - 1].timestamp
        : 0;

    const lastSender =
      chatStack.length > 0
        ? chatStack[chatStack.length - 1].sender.username
        : null;

    // console.log("elapsed: ", elapsed);
    // console.log("lastSender", lastSender);

    // new cluster if last message is more than 1 min ago or someone else messaged since
    if (true) {
      // if (elapsed > 60000 || lastSender !== localStorage.username) { // !
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

      // const workingStack = [...chatStack];
      // workingStack.push(pendingCluster);
      // console.log(chatStack);
      // console.log(workingStack);
      setChatStack((prevStack) => {
        console.log("prevStack: ", prevStack);
        const stackCopy = [...prevStack];
        // prevStack[prevStack.length];
        stackCopy.push(pendingCluster);
        // console.log("stackCopy: ", stackCopy);
        return stackCopy;
      });

      function clusterAcknowledged(res) {
        console.log("acknowledgement: ", res);
        // todo find that pending message and update it with response data
        // console.log("chatStack in ack: ", chatStack); // ! chatStack is one behind here
        // console.log("workingStack: ", workingStack);
        // const currentStack = [...chatStack];
        // console.log(workingStack);
        // ! not elegant, overwrites itself on fast messages
        // const index = workingStack.findIndex(
        //   (message) => message.clusterTimestamp === res.clusterTimestamp
        // );
        // console.log(index);
        // workingStack[index] = res;

        // setState callback is used to access the latest state, else it will lag behind
        setChatStack((prevStack) => {
          // spread so that the values instead of the pointer is referenced by the new variable
          // else state will see no change since the pointer doesn't change even if the values did
          const stackCopy = [...prevStack]; // * WORKS! god bless array spread 😀
          const index = stackCopy.findIndex(
            (message) => message.clusterTimestamp === res.clusterTimestamp
          );
          stackCopy[index] = res;
          return stackCopy;
        });
        // setChatStack([...workingStack]);
      }

      socket.emit("newCluster", genesisCluster, (res) => {
        clusterAcknowledged(res);
      });
      // socket.emit("newCluster", messageCluster, (res) => console.log(res));
    } else {
      // just push to cluster
      const messageCluster = chatStack[chatStack.length - 1];
      // console.log(messageCluster);
      messageCluster.content.push(messageData);

      // todo append the last cluster with this content

      // console.log(messageCluster);
      socket.emit("appendCluster", messageCluster /*AppendAcknowledgement*/);
    }
    // console.log("chatStack: ", chatStack); // empty arr
  }

  // todo set up intervals to rerender, for updated timestamp display

  function renderMessages(stack) {
    const renderedStack = [];

    function renderContent(content) {
      const renderedContent = [];

      // todo support content other than text
      content.forEach((content) => {
        renderedContent.push(
          <Message key={content.timestamp}>{content.text}</Message>
        );
      });
      return renderedContent;
    }

    stack.forEach((message) => {
      if (message.id) {
        // console.log("rendering sent");
        // console.log("sent key ", message.timestamp);
        // console.log("message.id: ", message.id);
        renderedStack.push(
          <Sender
            sender={message.sender}
            timestamp={message.clusterTimestamp}
            key={message.clusterTimestamp}
          >
            {renderContent(message.content)}
          </Sender>
        );
      } else {
        // console.log("rendering pending");
        // console.log("pending key ", message.timestamp);
        // console.log("message.id: ", message.id);
        renderedStack.push(
          <Pending
            sender={message.sender}
            timestamp={message.clusterTimestamp}
            key={message.clusterTimestamp}
          >
            {renderContent(message.content)}
          </Pending>
        );
      }
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
