import { useState, createContext } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupMounted, setGroupMounted] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    let result;
    result = groupData.findIndex((group) => group.id === idString);
    if (result === -1) {
      result = groupData.findIndex((group) =>
        group.channels.text.some((channel) => channel._id === idString)
      );
    }
    return result;
  }

  function getGroupId(idString) {
    let group = groupData.find((group) => group.id === idString);
    if (!group) {
      group = groupData.find((group) =>
        group.channels.text.some((channel) => channel._id === idString)
      );
    }
    return group._id;
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
    getGroupId,
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
