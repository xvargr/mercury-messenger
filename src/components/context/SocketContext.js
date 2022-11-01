import { useState, createContext, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { DataContext } from "./DataContext";
import { UiContext } from "./UiContext";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const [socketIsConnected, setSocketIsConnected] = useState(false);

  const {
    setGroupData,
    setChatData,
    getGroupIndex,
    getChannelIndex,
    isLoggedIn,
  } = useContext(DataContext);

  const {
    windowIsFocused,
    selectedChannel,
    selectedGroup,
    setSelectedChannel,
  } = useContext(UiContext);

  // these refs are used to provide the latest values and fix stale closures in socket events
  const selectedGroupRef = useRef(selectedGroup);
  const selectedChannelRef = useRef(selectedChannel);
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
    selectedChannelRef.current = selectedChannel;
  }, [selectedGroup, selectedChannel]);

  const navigate = useNavigate();
  const notification = new Audio("/beep.mp3");

  function connectSocket() {
    setSocket(
      io(`${window.location.protocol}//${window.location.hostname}:3100`, {
        withCredentials: true,
      })
    );
  }

  useEffect(() => {
    if (isLoggedIn && socketIsConnected === false) {
      connectSocket();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  function socketClear() {
    if (socket !== null) socket.disconnect();
    setSocket(null);
    setSocketIsConnected(false);
  }

  // this should only run once to avoid multiple instances of socket event listeners
  // this check avoids duplicate listeners
  // stale closure issue here, solved with refs, alternatively if in useEffect, ensure proper dependencies
  if (socket && !socket?._callbacks) {
    socket.on("connect", function (/*don't redefine socket here*/) {
      // "connect" not "connected"
      // console.log(`connected to socketio as ${socket.id}`);
      setSocketIsConnected(true);
    });

    socket.on("connect_error", (err) => {
      // console.log("iooooo"); // todo set error already connected
      setSocketIsConnected(false);
    });

    socket.on("initialize", (res) => setChatData(res));

    socket.on("newMessage", function (res) {
      if (
        windowIsFocused ||
        selectedChannelRef.current._id !== res.channel._id
      ) {
        notification.play();
      }

      setChatData((prevData) => {
        const dataCopy = { ...prevData };
        dataCopy[res.group._id][res.channel._id].push(res);
        return dataCopy;
      });
    });

    socket.on("appendMessage", function (res) {
      if (
        windowIsFocused ||
        selectedChannelRef.current._id !== res.target.channel
      ) {
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

      console.log(`${change.type} signal received for `);
      // console.log(res);

      if (target.type === "channel" && change.type === "delete") {
        setChatData((currentData) => {
          const dataCopy = { ...currentData };
          delete dataCopy[target.parent][target.id];
          return dataCopy;
        });

        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const parentIndex = getGroupIndex(target.parent ?? target.id);
          const channelIndex = getChannelIndex(target.parent, target.id);

          dataCopy[parentIndex].channels.text.splice(channelIndex, 1);
          return dataCopy;
        });

        if (selectedChannelRef.current?._id === target.id) {
          setSelectedChannel(null);
          navigate(`/g/${selectedGroupRef.current.name}`);
        }
      }

      // remove

      // update gdt & cdt // 2

      // * editing
      // find in gdt and cdt // 1
      if (target.type === "channel" && change.type === "edit") {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const parentIndex = getGroupIndex(target.parent);
          const channelIndex = getChannelIndex(target.parent, target.id);
          dataCopy[parentIndex].channels.text[channelIndex] = change.data;
          return dataCopy;
        });
      }

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
