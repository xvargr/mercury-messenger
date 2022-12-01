import { useState, createContext, useEffect, useRef } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupData, setGroupData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [peerData, setPeerData] = useState(null);
  const [groupMounted, setGroupMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // this ref is used to prevent stale closure in the helper functions below
  const groupDataRef = useRef(groupData);
  useEffect(() => {
    groupDataRef.current = groupData;
  }, [groupData]);

  // initialize chat data and peer data structure
  if (groupData && chatData === null) {
    const initChatData = {};
    groupData.forEach((group) => {
      const chatObject = {};
      group.channels.text.forEach((channel) => {
        chatObject[channel._id] = []; // set empty array for each channel
      });
      initChatData[group._id] = chatObject;
    });
    setChatData(initChatData);

    console.time("create peer tree");
    // ? dont init? if usr undefined, then assumes offline
    // const initPeerData = new Set();
    const initPeerData = {};
    groupData.forEach((group) => {
      // console.log(group);
      // initPeerData[group.id] = {};
      group.members.forEach((member) => {
        // initPeerData.add({
        //   id: member._id,
        //   status: "offline",
        // });

        // if (!initPeerData[member._id]){} // checking is slower

        // ? is checking if undefined faster than just overwriting?
        initPeerData[member._id] = {
          // id: member._id,
          status: "offline", // enum[online, away, busy, offline] type string
        };
      });
    });
    setPeerData(initPeerData);
    console.timeEnd("create peer tree");
  }
  // console.log(peerData);

  function getGroupIndex(idString) {
    const dataArray = groupDataRef.current ?? groupData;

    let result = dataArray.findIndex((group) => group.id === idString);

    if (result === -1) {
      result = dataArray.findIndex((group) =>
        group.channels.text.some((channel) => channel._id === idString)
      );
    }
    return result;
  }

  function getChannelIndex(parentId, channelId) {
    const dataArray = groupDataRef.current ?? groupData;
    const parentIndex = getGroupIndex(parentId);
    const result = dataArray[parentIndex].channels.text.findIndex(
      (channel) => channel._id === channelId
    );
    return result;
  }

  function addNewChat(groupIdString, channelIdString, chatData) {
    setChatData((prevData) => {
      const dataCopy = { ...prevData };
      if (!dataCopy[groupIdString]) {
        dataCopy[groupIdString] = {};
      }
      // empty chat array if no data was passed, assumes newly created group
      dataCopy[groupIdString][channelIdString] = chatData
        ? chatData[groupIdString][channelIdString]
        : [];
      return dataCopy;
    });
  }

  function removeChat(groupIdString, channelIdString) {
    // if only group id is provided, delete all the group's chat by removing the group itself
    setChatData((prevData) => {
      const dataCopy = { ...prevData };
      channelIdString
        ? delete dataCopy[groupIdString][channelIdString]
        : delete dataCopy[groupIdString];
      return dataCopy;
    });
  }

  function addNewGroup(groupObject, chatData) {
    setGroupData((prevData) => {
      const dataCopy = [...prevData];
      dataCopy.push(groupObject);
      return dataCopy;
    });
    groupObject.channels.text.forEach((channel) =>
      addNewChat(groupObject._id, channel._id, chatData)
    );
  }

  function removeGroup(groupIdString) {
    removeChat(groupIdString);
    setGroupData((prevData) => {
      const dataCopy = [...prevData];
      return dataCopy.filter((group) => group._id !== groupIdString);
    });
  }

  function patchGroup(groupObject) {
    const groupIndex = getGroupIndex(groupObject._id);
    setGroupData((prevData) => {
      const dataCopy = [...prevData];
      dataCopy[groupIndex] = groupObject;
      return dataCopy;
    });
  }

  const dataState = {
    groupData,
    setGroupData,
    setChatData,
    chatData,
    groupMounted,
    setGroupMounted,
    isLoggedIn,
    setIsLoggedIn,
    dataHelpers: {
      getGroupIndex,
      getChannelIndex,
      addNewGroup,
      addNewChat,
      removeGroup,
      removeChat,
      patchGroup,
    },
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
