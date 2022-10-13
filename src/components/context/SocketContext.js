import { useState, createContext, useContext } from "react";

import { DataContext } from "./DataContext";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const { setChatData } = useContext(DataContext);

  // this should only run once to avoid multiple instances of socket event listeners
  // this check avoids duplicate listeners
  if (socket && !socket._callbacks) {
    // socket.on("connect", function (/*don't redefine socket here*/) {
    //   // works, "connect" not "connected"
    //   // console.log(`connected as ${socket.id}`);
    // });

    socket.on("initialize", (res) => setChatData(res));

    // new message received handler
    socket.on("newMessage", function (res) {
      // todo only play when user not focused on window or not if current group/channel
      const notification = new Audio("/beep.mp3");
      notification.play();

      setChatData((prevData) => {
        const dataCopy = { ...prevData };
        dataCopy[res.group._id][res.channel._id].push(res);
        return dataCopy;
      });
      // setChatData(workingChatData);
    });

    socket.on("appendMessage", function (res) {
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy = dataCopy[res.target.group][res.target.channel];

        const clusterIndex = stackCopy.findIndex(
          (cluster) => cluster._id === res.target.cluster.id
        );

        // update stack to contain verified message
        stackCopy[clusterIndex].content[res.target.index] = res.data;
        dataCopy[res.target.group][res.target.channel] = stackCopy;

        return dataCopy;
      });
    });
  }

  const socketInstance = { socket, setSocket };

  return (
    <SocketContext.Provider value={socketInstance}>
      {props.children}
    </SocketContext.Provider>
  );
}
