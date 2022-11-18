import { useState, createContext, useEffect, useRef } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupMounted, setGroupMounted] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // this ref is used to prevent stale closure in the helper functions below
  const groupDataRef = useRef(groupData);
  useEffect(() => {
    groupDataRef.current = groupData;
  }, [groupData]);

  // initialize chat data structure
  if (groupData && chatData === null) {
    const workingChatData = {};

    groupData.forEach((group) => {
      const chatObject = {};
      group.channels.text.forEach((channel) => {
        chatObject[channel._id] = []; // set empty array for each channel
      });
      workingChatData[group._id] = chatObject;
    });
    setChatData(workingChatData);
  }

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

  function addNewChat(groupIdString, channelIdString) {
    setChatData((prevData) => {
      const dataCopy = { ...prevData };
      if (!dataCopy[groupIdString]) {
        dataCopy[groupIdString] = {};
      }
      dataCopy[groupIdString][channelIdString] = [];
      return dataCopy;
    });
  }

  // function removeChat(groupIdString, channelIdString){

  // }

  function addNewGroup(groupObject) {
    setGroupData((prevData) => {
      const dataCopy = [...prevData];
      dataCopy.push(groupObject);
      return dataCopy;
    });
    groupObject.channels.text.forEach((channel) =>
      addNewChat(groupObject._id, channel._id)
    );
  }

  function removeGroup(groupIdString) {
    setChatData((prevData) => {
      const dataCopy = { ...prevData };
      delete dataCopy[groupIdString];
      return dataCopy;
    });

    setGroupData((prevData) => {
      const dataCopy = [...prevData];
      return dataCopy.filter((group) => group._id !== groupIdString);
    });
  }

  const dataState = {
    groupData,
    setGroupData,
    groupMounted,
    setGroupMounted,
    isLoggedIn,
    setIsLoggedIn,
    chatData,
    setChatData,
    getGroupIndex,
    getChannelIndex,
    addNewGroup,
    addNewChat,
    removeGroup,
    // removeChat
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
