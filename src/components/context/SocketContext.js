import { useState, createContext, useContext, useEffect } from "react";

import { DataContext } from "./DataContext";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const { chatData, setChatData, groupMounted } = useContext(DataContext);

  // this should only run once to avoid multiple instances of socket event listeners
  // this check avoids duplicate listeners
  if (socket && !socket._callbacks) {
    socket.on("connect", function (/*don't redefine socket here*/) {
      // works, "connect" not "connected"
      console.log(`connected as ${socket.id}`);
    });

    // new message received handler
    socket.on("message", function (res) {
      console.log("message event: ", res);

      // todo only play when user not focused on window or not if current group/channel
      const notification = new Audio("/beep.mp3");
      notification.play();

      const workingChatData = { ...chatData };
      workingChatData[res.group._id][res.channel._id].push(res);
      setChatData(workingChatData);
    });
  }

  // if (socket?._callbacks && !("$connect" in socket._callbacks)) {
  //   // if (socket && socket._callbacks && socket._callbacks["something"]) {
  //   console.log("passed");
  //   socket.on("connect", function (/*don't redefine socket here*/) {
  //     // works, "connect" not "connected"
  //     console.log(`connected as ${socket.id}`);
  //   });
  // }

  // // new message received handler
  // socket?.on("message", function (res) {
  //   console.log("message event: ", res);

  //   // todo only play when user not focused on window or not if current group/channel
  //   const notification = new Audio("/beep.mp3");
  //   notification.play();

  //   // const workingChatData = [...chatData];
  //   // // console.log(workingChatData);

  //   // const groupIndex = workingChatData.findIndex(
  //   //   (data) => data.group.id === res.group._id
  //   // );

  //   // const channelIndex = workingChatData[groupIndex].channels.findIndex(
  //   //   (channel) => channel.id === res.channel._id
  //   // );

  //   // workingChatData[groupIndex].channels[channelIndex].messages.push(res);

  //   const workingChatData = { ...chatData };

  //   // console.log(workingChatData[res.group._id][res.channel._id]);
  //   // console.log(res.group._id);
  //   // console.log(res.channel._id);

  //   workingChatData[res.group._id][res.channel._id].push(res);

  //   setChatData(workingChatData);

  //   // console.log(groupIndex, channelIndex);

  //   // const messagesCopy = [...chatMessages];
  //   // messagesCopy.push(msg);
  //   // setChatMessages(messagesCopy);
  // });

  // ! check if handler is not installed before doing so to avoid duplicate event handlers
  // if (socket) {
  //   console.log(socket);
  //   console.log(socket._callbacks);
  //   console.log(socket._callbacks["$message"]);
  //   // console.log(socket._callbacks.$message);
  // }

  // // sent status handler
  // socket?.on("sent", function (msg) {
  //   console.log("sent event");
  //   console.log(msg);
  // });
  // }
  const socketInstance = { socket, setSocket };

  return (
    <SocketContext.Provider value={socketInstance}>
      {props.children}
    </SocketContext.Provider>
  );
}
