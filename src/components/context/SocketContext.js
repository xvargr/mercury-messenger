import { useState, createContext, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { FlashContext } from "./FlashContext";
import { DataContext } from "./DataContext";
import { UiContext } from "./UiContext";

// utility hooks
import axiosInstance from "../../utils/axios";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    message: null,
    code: null,
  });
  const { pushFlashMessage } = useContext(FlashContext);

  const {
    setGroupData,
    setChatMounted,
    dataMounted,
    setDataMounted,
    mountChat,
    setPeerData,
    dataHelpers,
    isLoggedIn,
    setIsLoggedIn,
  } = useContext(DataContext);

  const {
    windowIsFocused,
    selectedChannel,
    selectedGroup,
    setSelectedChannel,
    setSelectedGroup,
    clearSelected,
  } = useContext(UiContext);

  const { userGroups } = axiosInstance();

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
    if (isLoggedIn && !socketStatus.connected) {
      console.log("requesting connection");
      connectSocket();
    }
    return () => {
      socket?.disconnect();
      setSocketStatus({
        connected: false,
        message: null,
        code: null,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, dataMounted]);

  function socketClear() {
    if (socket !== null) socket.disconnect();
    setSocket(null);
    setSocketStatus({ connected: true, message: null, code: null });
  }

  // this should only run once to avoid multiple instances of socket event listeners
  // this check avoids duplicate listeners
  // stale closure issue here, solved with refs, alternatively if in useEffect, ensure proper dependencies
  if (socket && !socket?._callbacks) {
    socket.on("connect", function (/*don't redefine socket here*/) {
      // "connect" not "connected"

      userGroups
        .fetch()
        .then((res) => {
          const groupData = res.data;
          setGroupData(() => groupData);
          setDataMounted(true);
        })
        .catch((e) => e); // axios abort throws error unless it's caught here

      setSocketStatus({ connected: true, code: null, message: null });
    });

    socket.on("disconnect", () => {
      // setDataMounted(false);
      setChatMounted(false);
      setSocketStatus({ connected: false, code: 503, message: null });
    });

    socket.on("connect_error", (err) => {
      if (err.message === "xhr poll error") {
        setSocketStatus({
          connected: false,
          message: "Server unreachable",
          code: 503,
        });
      } else if (err.data.code === 403) {
        setSocketStatus({
          connected: false,
          message: err.data.message,
          code: err.data.code,
        });
      } else if (err.data.code === 401) {
        setIsLoggedIn(false);
      }
    });

    socket.on("initialize", (res) => {
      if (!dataMounted) {
        console.warn("trying to set chat before group is initialized");
        setTimeout(() => {
          mountChat(res.chatData, res.chatDepleted);
          setPeerData(res.peerData);
        }, 50);
      } else {
        mountChat(res.chatData);
        setPeerData(res.peerData);
      }
    });

    socket.on("newMessage", function (res) {
      if (
        windowIsFocused ||
        selectedChannelRef.current._id !== res.channel._id
      ) {
        notification.play();
      }

      setGroupData((prevData) => {
        const dataCopy = { ...prevData };

        dataCopy[res.group._id].chatData[res.channel._id].push(res);
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

      setGroupData((prevStack) => {
        const dataCopy = { ...prevStack };
        const stackCopy =
          dataCopy[res.target.group].chatData[res.target.channel];

        const clusterIndex = stackCopy.findIndex(
          (cluster) => cluster._id === res.target.cluster.id
        );

        // update stack to contain verified message
        stackCopy[clusterIndex].content[res.target.index] = res.data;
        dataCopy[res.target.group].chatData[res.target.channel] = stackCopy;

        return dataCopy;
      });
    });

    socket.on("structureChange", function (res) {
      const { target, change, messages } = res;

      // console.log(`${change.type} signal received`);
      // console.log(res);

      function createChannel() {
        setGroupData((currentData) => {
          const dataCopy = { ...currentData };

          dataCopy[target.parent].channels.text.push(change.data);
          dataCopy[target.parent].chatData[target.id] = [];
          return dataCopy;
        });
      }

      function editChannel() {
        setGroupData((currentData) => {
          const dataCopy = { ...currentData };
          const channelIndex = dataHelpers.getChannelIndex(
            target.parent,
            target.id
          );

          dataCopy[target.parent].channels.text[channelIndex] = change.data;
          return dataCopy;
        });

        if (selectedChannelRef.current?._id === target.id) {
          setSelectedChannel(change.data);
          navigate(`/g/${selectedGroupRef.current.name}/c/${change.data.name}`);
        }
      }

      function deleteChannel() {
        setGroupData((currentData) => {
          const dataCopy = { ...currentData };
          const channelIndex = dataHelpers.getChannelIndex(
            target.parent,
            target.id
          );

          dataCopy[target.parent].channels.text.splice(channelIndex, 1);
          delete dataCopy[target.parent].chatData[target.id];

          return dataCopy;
        });

        if (selectedChannelRef.current?._id === target.id) {
          setSelectedChannel(null);
          navigate(`/g/${selectedGroupRef.current.name}`);
        }
      }

      function createGroup() {
        setGroupData((currentData) => {
          const dataCopy = { ...currentData };
          dataCopy.push(change.data);
          dataCopy[target.parent].chatData[target.id] = [];
          return dataCopy;
        });
      }

      function editGroup() {
        const isKicked = change.extra?.toKick?.includes(localStorage.userId);

        setGroupData((currentData) => {
          const dataCopy = { ...currentData };

          if (isKicked) delete dataCopy[target.id];
          else {
            // move old chat to new group
            const chatCopy = dataCopy[target.id].chatData;
            dataCopy[target.id] = change.data;
            dataCopy[target.id].chatData = chatCopy;
          }

          return dataCopy;
        });

        if (selectedGroupRef.current?._id === target.id) {
          if (isKicked) {
            setSelectedGroup(null);
            setSelectedChannel(null);
            navigate("/");
          } else {
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
      }

      function deleteGroup() {
        setGroupData((currentData) => {
          const dataCopy = { ...currentData };
          delete dataCopy[target.id];
          return dataCopy;
        });

        if (selectedGroupRef.current?._id === target.id) {
          clearSelected();
          navigate(`/`);
        }
      }

      function joinedGroup() {
        setGroupData((currentData) => {
          const dataCopy = { ...currentData };
          dataCopy[target.id].members.push(change.extra.user);
          return dataCopy;
        });
      }

      function leftGroup(params) {
        setGroupData((currentData) => {
          const dataCopy = { ...currentData };

          dataCopy[target.id].members = dataCopy[target.id].members.filter(
            (member) => member._id !== change.extra.userId
          );

          dataCopy[target.id].administrators = dataCopy[
            target.id
          ].members.filter((admin) => admin._id !== change.extra.userId);

          return dataCopy;
        });
      }

      // function editMessage() {} // todo

      // function deleteMessage() {} // todo

      if (messages.length > 0) pushFlashMessage(messages); // transfer any messages to context

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

  const socketInstance = {
    socket,
    connectSocket,
    socketStatus,
    socketClear,
  };

  return (
    <SocketContext.Provider value={socketInstance}>
      {props.children}
    </SocketContext.Provider>
  );
}
