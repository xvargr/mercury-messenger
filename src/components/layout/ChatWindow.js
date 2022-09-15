import { useEffect, useState, useRef, useContext } from "react";
import { io } from "socket.io-client";

// import { useParams, useNavigate } from "react-router-dom";
// import { useContext } from "react";
// components
import Sender from "../chat/SenderWrapper";
import Message from "../chat/Message";
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";

const socket = io("http://localhost:3100/", { withCredentials: true }); // moved out of rfc to preserve

function ChatWindow() {
  // const { channel, group } = useParams();
  const { groupMounted } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const [chatMessages, setChatMessages] = useState([]);
  const endStopRef = useRef();

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`connected to server as ${socket.id}`);
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // scroll to bottom on every new message
    endStopRef.current.scrollIntoView();
  }, [chatMessages]);

  // todo dynamic send new message or update if less than 1 min

  // * on receive message
  socket.on("message", function (msg) {
    // console.log(msg);

    const messagesCopy = [...chatMessages];
    messagesCopy.push(msg);
    setChatMessages(messagesCopy);
  });
  // ? socket.on.appendMessage

  socket.on("connect_error", function (err) {
    console.log("connection refused");
    console.dir(err.message);
  });

  function sendOut(messageData) {
    console.log(messageData);

    // ? checks: under a minute, no other users sent a message
    const elapsed =
      chatMessages.length > 0
        ? Date.now() - chatMessages[chatMessages.length - 1].timestamp
        : 0;

    const lastSender =
      chatMessages.length > 0
        ? chatMessages[chatMessages.length - 1].senderId
        : null;

    // console.log(chatMessages);
    // console.log(elapsed);
    // console.log(lastSender);

    if (elapsed < 60000 && lastSender !== localStorage.username) {
      // construct new message
      const messageCluster = {
        senderId: localStorage.userId,
        target: { group: selectedGroup._id, channel: selectedChannel._id },
        content: messageData,
      };

      console.log(messageCluster);
      socket.emit("newMessageCluster", messageCluster);
    } else {
      // just push to cluster
      const messageCluster = chatMessages[chatMessages.length - 1];
      console.log(messageCluster);
      messageCluster.content.push(messageData);

      // console.log(messageCluster);
      socket.emit("pushMessageCluster", messageData);
    }
  }

  function MessagesWindow(messages) {
    // expect messages to me array of objects
    // [{msg}{msg}...]
  }

  // ! todo skeleton loader while group is not loaded yet, right now will result in crash

  return (
    <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
      <ChannelBanner name={selectedChannel.name} />

      <div className="w-full flex-grow overflow-y-scroll scrollbar-dark scroll-smooth">
        {chatMessages?.map((message) => {
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

export default ChatWindow;
