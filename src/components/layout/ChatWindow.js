import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
// components
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
import { ChatSkeletonLoader } from "../ui/SkeletonLoaders";
import { SocketContext } from "../context/SocketContext";

// const socket = io("http://localhost:3100/", { withCredentials: true });

function ChatWindow() {
  const { channel } = useParams();
  const { groupMounted } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { socket } = useContext(SocketContext);
  const [ChatStack, setChatStack] = useState([]);
  const endStopRef = useRef();

  useEffect(() => {
    // scroll to bottom on every new message
    if (endStopRef.current) endStopRef.current.scrollIntoView();
  }, [ChatStack]);

  // todo dynamic send new message or update if less than 1 min

  function sendOut(messageData) {
    // ? checks: under a minute, no other users sent a message
    const elapsed =
      ChatStack.length > 0
        ? Date.now() - ChatStack[ChatStack.length - 1].timestamp
        : 0;

    const lastSender =
      ChatStack.length > 0 ? ChatStack[ChatStack.length - 1].senderId : null;

    console.log("elapsed: ", elapsed);
    console.log("lastSender", lastSender);

    // create new message cluster or append an the latest one if sent less than a minute
    if (elapsed < 60000 && lastSender !== localStorage.username) {
      // construct new message
      const messageCluster = {
        senderId: localStorage.userId,
        target: { group: selectedGroup._id, channel: selectedChannel._id },
        content: messageData,
      };

      // *
      // todo create new cluster and append to messages when sent verified
      const workingStack = [...ChatStack];
      workingStack.push(); // ! here

      // *

      socket.emit("newCluster", messageCluster);
      // todo pending messages
    } else {
      // just push to cluster
      const messageCluster = ChatStack[ChatStack.length - 1];
      // console.log(messageCluster);
      messageCluster.content.push(messageData);

      // *
      // todo append the last cluster with this content

      // *

      // console.log(messageCluster);
      socket.emit("appendCluster", messageCluster);
    }
    console.table(ChatStack);
  }

  // function MessagesWindow(messages) {
  //   // expect messages to me array of objects
  //   // [{msg}{msg}...]
  // }

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
          {ChatStack?.map((message) => {
            // todo waiting for final schema from api
            // return (
            //   <Sender
            //     user={message.user}
            //     // img={message.userImage}
            //     timestamp={message.timestamp}
            //     key={message.timestamp}
            //   >
            //     <Message>{message.content.text}</Message>
            //     {/*append to this for consecutive messages by the same sender under 1 min*/}
            //   </Sender>
            // );
          })}
          <div className="w-full h-24" ref={endStopRef}></div>
          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  }
}

export default ChatWindow;
