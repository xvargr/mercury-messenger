import { useState, createContext } from "react";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const socketInstance = { socket, setSocket };

  socket?.on("connect", function (/*don't redefine socket here*/) {
    // * works, "connect" not connected, and don't redefine socket
    console.log("connected!");
    // console.log(socket);
  });

  // new message received handler
  socket?.on("message", function (msg) {
    console.log("message event");
    console.log(msg);

    // todo only play when user not focused on window or not if current group/channel
    const notification = new Audio("/beep.mp3");
    notification.play();
    // const messagesCopy = [...chatMessages];
    // messagesCopy.push(msg);
    // setChatMessages(messagesCopy);
  });

  // // sent status handler
  // socket?.on("sent", function (msg) {
  //   console.log("sent event");
  //   console.log(msg);
  // });

  return (
    <SocketContext.Provider value={socketInstance}>
      {props.children}
    </SocketContext.Provider>
  );
}
