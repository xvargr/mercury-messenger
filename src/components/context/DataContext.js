import { useState, createContext } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupMounted, setGroupMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [chatData, setChatData] = useState(null);

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

  function patchChatContext(input) {
    const { groupId = null, channelId = null, type = null } = input;

    setChatData((prevData) => {
      const workingData = { ...prevData };

      if (!channelId) throw new Error("channel id is required");
      if (!groupId) throw new Error("group id is required");

      if (type === "new") workingData[groupId] = {};
      else if (type === "add") workingData[groupId][channelId] = [];
      else throw new Error("type is required");

      return workingData;
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
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
