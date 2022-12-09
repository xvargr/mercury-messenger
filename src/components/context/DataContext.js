import { useState, createContext, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";

// import Sender from "../chat/SenderWrapper";
// import Message from "../chat/Message";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupData, setGroupData] = useState(null);
  const [initialized, setInitialized] = useState(false);
  // const [chatData, setChatData] = useState(null);
  const [peerData, setPeerData] = useState(null);
  const [dataMounted, setDataMounted] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // const { group, channel } = useParams();
  // const { group: groupParam, channel: channelParam } = useParams();

  // this ref is used to prevent stale closure in the helper functions below
  const groupDataRef = useRef(groupData);
  useEffect(() => {
    groupDataRef.current = groupData;
  }, [groupData]);

  useEffect(() => {
    if (dataMounted && chatMounted) setDataReady(true);
    else setDataReady(false);
  }, [dataMounted, chatMounted]);

  // useEffect(() => {
  //   console.log("DATAREADY: ", dataReady);
  //   console.log(channel);
  //   console.log(group);
  //   // console.log(groupParam);
  //   // console.log(channelParam);
  // }, [dataReady]);

  // initialize chat data and peer data structure @ first load
  if (groupData && !initialized /*&& chatData === null*/) {
    // const initChatData = {};
    // groupData.forEach((group) => {
    //   const chatObject = {};
    //   group.channels.text.forEach((channel) => {
    //     chatObject[channel._id] = []; // set empty array for each channel
    //   });
    //   initChatData[group._id] = chatObject;
    // });

    for (const groupId in groupData) {
      // console.log(group);
      // debugger;
      groupData[groupId].chatData = {};
      groupData[groupId].channels.text.forEach(
        (channel) => (groupData[groupId].chatData[channel._id] = [])
      );
    }

    const initPeerData = {};

    // setChatData(initChatData);

    // // console.time("create peer tree");
    // // ? dont init? if usr undefined, then assumes offline
    // // const initPeerData = new Set();
    // // const initPeerData = {};
    // groupData.forEach((group) => {
    //   // console.log(group);
    //   // initPeerData[group.id] = {};
    //   group.members.forEach((member) => {
    //     // initPeerData.add({
    //     //   id: member._id,
    //     //   status: "offline",
    //     // });

    //     // if (!initPeerData[member._id]){} // checking is slower

    //     // ? is checking if undefined faster than just overwriting?
    //     initPeerData[member._id] = {
    //       // id: member._id,
    //       status: "offline", // enum[online, away, busy, offline] type string
    //     };
    //   });
    // });
    setPeerData(initPeerData);
    setInitialized(true);
    // console.timeEnd("create peer tree");
  }

  function mountChat(data) {
    // console.log(data);
    // // console.log(dataMounted);
    // // console.log(groupData);
    // // console.log(groupDataRef);
    // for (const groupId in data) {
    //   // console.log(groupDataRef.current[groupId]);
    //   groupDataRef.current[groupId].chatData = { ...data[groupId] };
    // }
    // setGroupData(groupDataRef.current);
    setGroupData((prevData) => {
      // console.log(prevData);
      const dataCopy = { ...prevData };

      for (const groupId in data) {
        // console.log(groupDataRef.current[groupId]);
        dataCopy[groupId].chatData = { ...data[groupId] };
      }
      return dataCopy;
    });

    setChatMounted(true);
  }

  // function getGroupIndex(idString) {
  //   const dataArray = groupDataRef.current ?? groupData;

  //   let result = dataArray.findIndex((group) => group.id === idString);

  //   if (result === -1) {
  //     result = dataArray.findIndex((group) =>
  //       group.channels.text.some((channel) => channel._id === idString)
  //     );
  //   }
  //   return result;
  // }

  // function getChannelIndex(parentId, channelId) {
  //   const dataArray = groupDataRef.current ?? groupData;
  //   const parentIndex = getGroupIndex(parentId);
  //   const result = dataArray[parentIndex].channels.text.findIndex(
  //     (channel) => channel._id === channelId
  //   );
  //   return result;
  // }

  function addNewChat(groupIdString, channelIdString, chatData) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };
      // if (!dataCopy[groupIdString].chatData[channelIdString]) {
      //   dataCopy[groupIdString].chatData[channelIdString] = {};
      // }
      dataCopy[groupIdString].chatData[channelIdString] = [...chatData];

      // empty chat array if no data was passed, assumes newly created group
      // dataCopy[groupIdString][channelIdString] = chatData
      //   ? chatData[groupIdString][channelIdString]
      //   : [];
      return dataCopy;
    });
    // setChatData((prevData) => {
    //   const dataCopy = { ...prevData };
    //   if (!dataCopy[groupIdString]) {
    //     dataCopy[groupIdString] = {};
    //   }
    //   // empty chat array if no data was passed, assumes newly created group
    //   dataCopy[groupIdString][channelIdString] = chatData
    //     ? chatData[groupIdString][channelIdString]
    //     : [];
    //   return dataCopy;
    // });
  }

  function removeChat(groupIdString, channelIdString) {
    // if only group id is provided, delete all the group's chat by removing the group itself
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };

      delete dataCopy[groupIdString].chatData[channelIdString];

      // channelIdString
      //   ? delete dataCopy[groupIdString][channelIdString]
      //   : delete dataCopy[groupIdString];
      return dataCopy;
    });
    // // if only group id is provided, delete all the group's chat by removing the group itself
    // setChatData((prevData) => {
    //   const dataCopy = { ...prevData };
    //   channelIdString
    //     ? delete dataCopy[groupIdString][channelIdString]
    //     : delete dataCopy[groupIdString];
    //   return dataCopy;
    // });
  }

  function addNewGroup(groupObject, chatData) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };
      dataCopy[groupObject._id] = groupObject;
      return dataCopy;
    });
    groupObject.channels.text.forEach((channel) =>
      addNewChat(groupObject._id, channel._id, chatData)
    );
    // setGroupData((prevData) => {
    //   const dataCopy = [...prevData];
    //   dataCopy.push(groupObject);
    //   return dataCopy;
    // });
    // groupObject.channels.text.forEach((channel) =>
    //   addNewChat(groupObject._id, channel._id, chatData)
    // );
  }

  function removeGroup(groupIdString) {
    removeChat(groupIdString);
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };
      delete dataCopy[groupIdString];
      return dataCopy;
    });
    // removeChat(groupIdString);
    // setGroupData((prevData) => {
    //   const dataCopy = [...prevData];
    //   return dataCopy.filter((group) => group._id !== groupIdString);
    // });
  }

  function patchGroup(groupObject) {
    // const groupIndex = getGroupIndex(groupObject._id);
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };
      const chatCopy = { ...dataCopy[groupObject._id].chatData };

      dataCopy[groupObject._id] = groupObject;
      dataCopy[groupObject._id].chatData = chatCopy;
      return dataCopy;
    });
    // const groupIndex = getGroupIndex(groupObject._id);
    // setGroupData((prevData) => {
    //   const dataCopy = [...prevData];
    //   dataCopy[groupIndex] = groupObject;
    //   return dataCopy;
    // });
  }

  function getStatus(idString) {
    return peerData[idString]?.status || "offline";
  }

  function changeStatus(idString) {} // TODO

  function getLastInfo(groupId, channelId) {
    const chatStack = groupData[groupId].chatData[channelId];

    const elapsed =
      chatStack.length > 0
        ? Date.now() - chatStack[chatStack.length - 1].clusterTimestamp
        : 0;

    const lastSender =
      chatStack.length > 0
        ? chatStack[chatStack.length - 1].sender.username
        : null;

    const lastCluster =
      chatStack.length > 0 ? chatStack[chatStack.length - 1] : null;

    return { elapsed, lastCluster, lastSender };
  }

  const dataState = {
    groupData,
    setGroupData,
    // setChatData,
    // chatData,
    dataMounted,
    setDataMounted,
    // chatMounted,
    // setChatMounted,
    isLoggedIn,
    setIsLoggedIn,
    peerData,
    setPeerData,
    dataReady,
    mount: { chat: mountChat },
    dataHelpers: {
      // getGroupIndex,
      // getChannelIndex,
      addNewGroup,
      addNewChat,
      removeGroup,
      removeChat,
      patchGroup,
      getLastInfo,
      // renderChatStack,
    },
    peerHelpers: {
      getStatus,
      changeStatus,
    },
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
