import { useState, createContext, useContext } from "react";
import { io } from "socket.io-client";

import { DataContext } from "./DataContext";
import { UiContext } from "./UiContext";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const [socketIsConnected, setSocketIsConnected] = useState(false);

  const { setChatData } = useContext(DataContext);
  const { windowIsFocused, selectedChannel } = useContext(UiContext);

  const notification = new Audio("/beep.mp3");

  function connectSocket() {
    setSocket(
      io(`${window.location.protocol}//${window.location.hostname}:3100`, {
        withCredentials: true,
      })
    );
  }

  function socketClear() {
    if (socket !== null) socket.disconnect();
    setSocket(null);
    setSocketIsConnected(false);
  }

  // this should only run once to avoid multiple instances of socket event listeners
  // this check avoids duplicate listeners
  if (socket && !socket._callbacks) {
    socket.on("connect", function (/*don't redefine socket here*/) {
      // "connect" not "connected"
      setSocketIsConnected(true);
    });

    socket.on("connect_error", (err) => {
      setSocketIsConnected(false);
    });

    socket.on("initialize", (res) => setChatData(res));

    // new message received handler
    socket.on("newMessage", function (res) {
      if (windowIsFocused || selectedChannel._id !== res.channel._id) {
        notification.play();
      }

      setChatData((prevData) => {
        const dataCopy = { ...prevData };
        dataCopy[res.group._id][res.channel._id].push(res);
        return dataCopy;
      });
      // setChatData(workingChatData);
    });

    socket.on("appendMessage", function (res) {
      if (windowIsFocused || selectedChannel._id !== res.target.channel) {
        notification.play();
      }

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

    socket.on("structureChange", function (res) {
      // const { target, change } = res;

      console.log("Struct change signal received");
      console.log(res);

      // * deleting
      // find in gdt and cdt // 1

      // remove

      // update gdt & cdt // 2

      // * editing
      // find in gdt and cdt // 1

      // append edit content

      // update gdt & cdt // 2

      // * create
      // create item in gdt and cdt

      // update gdt & cdt // 2
    });
  }

  // todo users online

  const socketInstance = {
    socket,
    connectSocket,
    socketIsConnected,
    socketClear,
  };

  return (
    <SocketContext.Provider value={socketInstance}>
      {props.children}
    </SocketContext.Provider>
  );
}
