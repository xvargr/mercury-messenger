import { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { DataContext } from "./DataContext";
import { UiContext } from "./UiContext";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const [socketIsConnected, setSocketIsConnected] = useState(false);

  const { groupData, setGroupData, chatData, setChatData, getGroupIndex } =
    useContext(DataContext);
  const { windowIsFocused, selectedChannel, selectedGroup } =
    useContext(UiContext);

  const navigate = useNavigate();
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
      const { target, change } = res;

      console.log("Struct change signal received");
      console.log(res);

      // * deleting
      // find in gdt and cdt // 1
      if (target.type === "channel" && change.type === "delete") {
        setGroupData((currentData) => {
          // ! PARENT will be unavailable here
          const dataCopy = [...currentData];
          const parentIndex = getGroupIndex(target.parent); // ! find an alternative way to get this index

          // ! channels undefined
          const channelIndex = dataCopy[parentIndex].channels.text.findIndex(
            (channel) => channel._id === target.id
          );

          delete dataCopy[parentIndex].channels.text[channelIndex];
          return dataCopy;
        });
        setChatData((currentData) => {
          const dataCopy = { ...currentData };
          delete dataCopy[target.parent][target.id]; // ! and here
          return dataCopy;
        });

        if (selectedChannel._id === target.id) {
          navigate(`/g/${selectedGroup.name}`);
        }
      }

      // remove

      // update gdt & cdt // 2

      // * editing
      // find in gdt and cdt // 1

      // append edit content

      // update gdt & cdt // 2

      // * create
      // create item in gdt and cdt
      if (target.type === "channel" && change.type === "create") {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const parentIndex = getGroupIndex(target.parent);

          dataCopy[parentIndex].channels.text.push(change.data);
          return dataCopy;
        });
        setChatData((currentData) => {
          const dataCopy = { ...currentData };
          dataCopy[target.parent][target.id] = [];
          return dataCopy;
        });
      }

      // ! can lose admin status on update sometimes ??

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
