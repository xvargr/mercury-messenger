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
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
