import { useState, createContext, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { DataContext } from "./DataContext";
import { UiContext } from "./UiContext";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const [socketIsConnected, setSocketIsConnected] = useState(false);

  const { setGroupData, setChatData, dataHelpers, isLoggedIn } =
    useContext(DataContext);

  const {
    windowIsFocused,
    selectedChannel,
    selectedGroup,
    setSelectedChannel,
    setSelectedGroup,
    clearSelected,
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

  // initial connection
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
      // console.log("iooooo"); // todo set error already connected, force connection here
      setSocketIsConnected(false);
    });

    // todo on reconnected request new grp and cht data

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
      console.log(res);

      function createChannel() {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const parentIndex = dataHelpers.getGroupIndex(target.parent);

          dataCopy[parentIndex].channels.text.push(change.data);
          return dataCopy;
        });

        setChatData((currentData) => {
          const dataCopy = { ...currentData };
          dataCopy[target.parent][target.id] = [];
          return dataCopy;
        });
      }

      function editChannel() {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const parentIndex = dataHelpers.getGroupIndex(target.parent);
          const channelIndex = dataHelpers.getChannelIndex(
            target.parent,
            target.id
          );
          dataCopy[parentIndex].channels.text[channelIndex] = change.data;
          return dataCopy;
        });

        if (selectedChannelRef.current?._id === target.id) {
          setSelectedChannel(change.data);
          navigate(`/g/${selectedGroupRef.current.name}/c/${change.data.name}`);
        }
      }

      function deleteChannel() {
        setChatData((currentData) => {
          const dataCopy = { ...currentData };
          delete dataCopy[target.parent][target.id];
          return dataCopy;
        });

        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const parentIndex = dataHelpers.getGroupIndex(
            target.parent ?? target.id
          );
          const channelIndex = dataHelpers.getChannelIndex(
            target.parent,
            target.id
          );

          dataCopy[parentIndex].channels.text.splice(channelIndex, 1);
          return dataCopy;
        });

        if (selectedChannelRef.current?._id === target.id) {
          setSelectedChannel(null);
          navigate(`/g/${selectedGroupRef.current.name}`);
        }
      }

      function createGroup() {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          dataCopy.push(change.data);
          return dataCopy;
        });

        setChatData((currentData) => {
          const dataCopy = { ...currentData };
          dataCopy[target.parent] = {};
          dataCopy[target.parent][target.id] = [];
          return dataCopy;
        });
      }

      function editGroup() {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const groupIndex = dataHelpers.getGroupIndex(target.id);

          dataCopy[groupIndex] = change.data;
          return dataCopy;
        });

        if (selectedGroupRef.current?._id === target.id) {
          setSelectedGroup(change.data);

          // reroute to updated, depending on if in channel
          if (selectedChannelRef.current) {
            navigate(
              `/g/${change.data.name}/c/${selectedChannelRef.current.name}`
            );
          } else {
            navigate(`/g/${change.data.name}`);
          }
        }
      }

      function deleteGroup() {
        setChatData((currentData) => {
          const dataCopy = { ...currentData };
          delete dataCopy[target.id];
          return dataCopy;
        });

        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const groupIndex = dataHelpers.getGroupIndex(target.id);
          dataCopy.splice(groupIndex, 1);
          return dataCopy;
        });

        if (selectedGroupRef.current?._id === target.id) {
          clearSelected();
          navigate(`/`);
        }
      }

      function joinedGroup() {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const groupIndex = dataHelpers.getGroupIndex(target.id);

          dataCopy[groupIndex].members.push(change.extra.user);
          return dataCopy;
        });
      }

      function leftGroup(params) {
        setGroupData((currentData) => {
          const dataCopy = [...currentData];
          const groupIndex = dataHelpers.getGroupIndex(target.id);

          dataCopy[groupIndex].members = dataCopy[groupIndex].members.filter(
            (member) => member._id !== change.extra.userId
          );
          return dataCopy;
        });
      }

      // function editMessage() {} // todo

      // function deleteMessage() {} // todo

      if (target.type === "channel") {
        if (change.type === "create") createChannel();
        else if (change.type === "edit") editChannel();
        else if (change.type === "delete") deleteChannel();
      } else if (target.type === "group") {
        if (change.type === "create") createGroup();
        else if (change.type === "edit") editGroup();
        else if (change.type === "delete") deleteGroup();
        else if (change.type === "join") joinedGroup();
        else if (change.type === "leave") leftGroup();
      }
      // else if (target.type === "message") {
      //   if (change.type === "edit") editMessage();
      //   else if (change.type === "delete") deleteMessage();
      // }
    });
  }

  // todo users online
  // * see socket.io room events, create delete join leave

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
