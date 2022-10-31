import { useState, createContext, useContext, useEffect } from "react";
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
    chatData,
    setGroupData,
    setChatData,
    getGroupIndex,
    getChannelIndex,
    isLoggedIn,
  } = useContext(DataContext);

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
  // ! stale closure issue here
  useEffect(() => {
    // console.log(socket);
    // console.count("socket events redefined");
    console.log("socket callbacks", socket?._callbacks);
    // if (!socket?._callbacks) {
    // if (socket && !socket?._callbacks) {
    // ! socket callback are duplicating!
    if (socket) {
      // if (socket._callbacks) delete socket._callbacks;
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

        // console.log("Struct change signal received");
        console.log("//////////////////////////");
        console.count(`${change.type} signal received for `);
        // console.log(res);
        // console.log("selectedChannel in context", selectedChannel?.name);
        // ! ALWAYS THE LAST CHANNEL SELECTED BEFORE REFRESH ! //

        // ?
        // ! this may be a case of stale closure // C01
        // * possible solutions, react effect dependencies, useRef() as store and reference
        // https://medium.com/@anandsimmy7/stale-closures-and-react-hooks-ea60689a3544
        // https://stackoverflow.com/questions/70544016/is-there-any-better-way-to-avoid-stale-closures-in-react-hooks
        // ?
        if (target.type === "channel" && change.type === "delete") {
          setChatData((currentData) => {
            console.count("C/ THIS SHOULD RUN ONCE");
            const dataCopy = { ...currentData };
            delete dataCopy[target.parent][target.id];
            return dataCopy;
          });

          setGroupData((currentData) => {
            // debugger; // ! setGrpData runs twice sometimes
            const dataCopy = [...currentData];
            const parentIndex = getGroupIndex(target.parent ?? target.id);
            const channelIndex = getChannelIndex(target.parent, target.id);

            console.count("G/ THIS SHOULD RUN ONCE");
            dataCopy[parentIndex].channels.text.splice(channelIndex, 1);
            return dataCopy;
          });
          // console.log(chatData);
          // console.log(groupData);

          // ! BUG -  SELECTED CHANNEL IS UNDEFINED , BUT SELcH === UNDEF : FALSE
          // ! SELCH NULL IN DEBUG !!!

          // console.log("SECO");
          // console.log("undef", selectedChannel === undefined);
          // console.log("inv", !selectedChannel);
          // debugger;

          // console.log("selectedChannel", selectedChannel?._id);
          // console.log("targId", target.id);

          if (selectedChannel?._id === target.id)
            navigate(`/g/${selectedGroup.name}`);
          console.count("delete operation completed");
          console.log("//////////////////////////");
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
          // setChatData((currentData) => { }
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
  }, [socket, selectedChannel, selectedGroup]); // ! stale closure, needs dependencies of group and channel, but duplicates
  // if (socket && !socket._callbacks) {
  // socket.on("connect", function (/*don't redefine socket here*/) {
  //   // "connect" not "connected"
  //   setSocketIsConnected(true);
  // });

  // socket.on("connect_error", (err) => {
  //   setSocketIsConnected(false);
  // });

  // socket.on("initialize", (res) => setChatData(res));

  // // new message received handler
  // socket.on("newMessage", function (res) {
  //   if (windowIsFocused || selectedChannel._id !== res.channel._id) {
  //     notification.play();
  //   }

  //   setChatData((prevData) => {
  //     const dataCopy = { ...prevData };
  //     dataCopy[res.group._id][res.channel._id].push(res);
  //     return dataCopy;
  //   });
  //   // setChatData(workingChatData);
  // });

  // socket.on("appendMessage", function (res) {
  //   if (windowIsFocused || selectedChannel._id !== res.target.channel) {
  //     notification.play();
  //   }

  //   setChatData((prevStack) => {
  //     const dataCopy = { ...prevStack };
  //     const stackCopy = dataCopy[res.target.group][res.target.channel];

  //     const clusterIndex = stackCopy.findIndex(
  //       (cluster) => cluster._id === res.target.cluster.id
  //     );

  //     // update stack to contain verified message
  //     stackCopy[clusterIndex].content[res.target.index] = res.data;
  //     dataCopy[res.target.group][res.target.channel] = stackCopy;

  //     return dataCopy;
  //   });
  // });

  // socket.on("structureChange", function (res) {
  //   const { target, change } = res;

  //   console.log("Struct change signal received");
  //   console.count(res.change.type);
  //   console.log(res);
  //   console.log("selectedChannel in context", selectedChannel?.name);
  //   // console.log("selectedChannel1", selectedChannel?.name);
  //   // ! ALWAYS THE LAST CHANNEL SELECTED BEFORE REFRESH ! //

  //   // ?
  //   // ! this may be a case of stale closure
  //   // ?
  //   if (target.type === "channel" && change.type === "delete") {
  //     setChatData((currentData) => {
  //       const dataCopy = { ...currentData };
  //       delete dataCopy[target.parent][target.id];
  //       return dataCopy;
  //     });

  //     setGroupData((currentData) => {
  //       const dataCopy = [...currentData];
  //       const parentIndex = getGroupIndex(target.parent ?? target.id);
  //       const channelIndex = getChannelIndex(target.parent, target.id);

  //       dataCopy[parentIndex].channels.text.splice(channelIndex, 1);
  //       return dataCopy;
  //     });

  //     // ! BUG -  SELECTED CHANNEL IS UNDEFINED , BUT SELcH === UNDEF : FALSE
  //     // ! SELCH NULL IN DEBUG !!!

  //     // console.log("SECO");
  //     console.log("selectedChannel", selectedChannel?._id);
  //     // console.log("undef", selectedChannel === undefined);
  //     // console.log("inv", !selectedChannel);
  //     console.log("targId", target.id);
  //     // debugger;

  //     // ! cannot reliably reroute
  //     if (!selectedChannel || selectedChannel?._id === target.id) {
  //       console.log("rerouting");
  //       navigate(`/g/${selectedGroup.name}`);
  //     } else console.log("not rerouting");
  //   }

  //   // remove

  //   // update gdt & cdt // 2

  //   // * editing
  //   // find in gdt and cdt // 1
  //   if (target.type === "channel" && change.type === "edit") {
  //     setGroupData((currentData) => {
  //       const dataCopy = [...currentData];
  //       const parentIndex = getGroupIndex(target.parent);
  //       const channelIndex = getChannelIndex(target.parent, target.id);
  //       dataCopy[parentIndex].channels.text[channelIndex] = change.data;
  //       return dataCopy;
  //     });
  //     // setChatData((currentData) => { }
  //   }

  //   // append edit content

  //   // update gdt & cdt // 2

  //   // * create
  //   // create item in gdt and cdt
  //   if (target.type === "channel" && change.type === "create") {
  //     setGroupData((currentData) => {
  //       const dataCopy = [...currentData];
  //       const parentIndex = getGroupIndex(target.parent);

  //       dataCopy[parentIndex].channels.text.push(change.data);
  //       return dataCopy;
  //     });
  //     setChatData((currentData) => {
  //       const dataCopy = { ...currentData };
  //       dataCopy[target.parent][target.id] = [];
  //       return dataCopy;
  //     });
  //   }

  //   // ! can lose admin status on update sometimes ??

  //   // update gdt & cdt // 2
  // });
  // }

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
