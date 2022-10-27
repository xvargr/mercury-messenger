import { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { DataContext } from "./DataContext";
import { UiContext } from "./UiContext";

export const SocketContext = createContext();

export function SocketStateProvider(props) {
  const [socket, setSocket] = useState(null);
  const [socketIsConnected, setSocketIsConnected] = useState(false);

  const {
    groupData,
    setGroupData,
    chatData,
    setChatData,
    getGroupIndex,
    getGroupId,
  } = useContext(DataContext);

  const { windowIsFocused, selectedChannel, selectedGroup } =
    useContext(UiContext);

  const navigate = useNavigate();
  const notification = new Audio("/beep.mp3");

  function connectSocket() {
    console.log("connecting socket");
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
      console.log("socket connect err");
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
      const { target, change, initiator } = res;

      console.log("Struct change signal received");
      console.count(res.change.type);
      console.log(res);

      // * deleting
      // find in gdt and cdt // 1
      // ! BUG CENTRAL //
      // ! KEEP  CLEAR //
      // ! BUG CENTRAL //
      if (target.type === "channel" && change.type === "delete") {
        console.log("deleting channel");
        // console.log("selectedChannel._id", selectedChannel._id);
        // console.log("target.id", target.id);

        // setChatData((currentData) => {
        //   const dataCopy = { ...currentData };
        //   const parentId = getGroupId(target.parent ?? target.id);

        //   delete dataCopy[parentId][target.id];
        //   console.log(dataCopy)
        //   return dataCopy;
        // });
        // setGroupData((currentData) => {
        //   const dataCopy = [...currentData];
        //   const parentIndex = getGroupIndex(target.parent ?? target.id);
        //   const channelIndex = dataCopy[parentIndex].channels.text.findIndex(
        //     (channel) => channel._id === target.id
        //   );

        //   delete dataCopy[parentIndex].channels.text[channelIndex];
        //   console.log(dataCopy)
        //   return dataCopy;
        // });

        const parentId = getGroupId(target.parent ?? target.id);
        const updatedChatData = { ...chatData };

        delete updatedChatData[parentId][target.id];
        console.log("CDT", updatedChatData);

        const updatedGroupData = [...groupData];
        const parentIndex = getGroupIndex(target.parent ?? target.id);
        const channelIndex = updatedGroupData[
          parentIndex
        ].channels.text.findIndex((channel) => channel._id === target.id);
        delete updatedGroupData[parentIndex].channels.text[channelIndex];
        // ! fails before here if is not delete-e and in deleted channel
        console.log("GDT", updatedGroupData);

        // debugger; // ! didn't get here reliably
        console.log("selectedChannel", selectedChannel);
        try {
          // ! this fails sometimes // selectedChannel is null possibly from axios .then()
          console.log(
            "selectedChannel._id",
            selectedChannel?.name,
            selectedChannel?._id
          );
        } catch {
          console.log("failed 1");
        }
        try {
          console.log("target.id", target.id);
        } catch {
          console.log("failed 2");
        }

        // ! BUGS
        // ! socket keeps adding connections
        // ! does not reliably respond to this struct change
        // ! other channel's chatData gets emptied!

        //! THIS IS CONFLICT WITH AXIOS .THEN() !//

        setChatData(updatedChatData);
        setGroupData(updatedGroupData);

        if (selectedChannel?._id === target.id) {
          console.log("rerouting");
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
