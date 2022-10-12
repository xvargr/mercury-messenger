import { useState, createContext } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupMounted, setGroupMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [chatData, setChatData] = useState(null);

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

  // // to be used when joining or making a new group
  // function addGroup(newGroup) {
  //   // accepts group document
  //   // add to groupData
  //   setGroupData((currentData) => {
  //     const workingData = [...currentData];
  //     workingData.push(newGroup);
  //     return workingData;
  //   });

  //   // add to chatData
  //   setChatData((currentData) => {
  //     const workingData = { ...currentData };
  //     workingData[newGroup._id] = {};
  //     newGroup.channels.text.forEach(
  //       (channel) => (workingData[newGroup._id][channel._id] = [])
  //     );
  //     return workingData;
  //   });
  // }

  // // to be used when creating a new channel
  // function addChannel(params) {
  //   const { parent, newChannel } = params;
  //   // accept channel and parent document
  //   // assumes parent group exists

  //   // add to groupData
  //   setGroupData((currentData) => {
  //     const workingData = [...currentData];
  //     const parentIndex = workingData.findIndex(
  //       (group) => group._id === parent._id
  //     );
  //     if (parentIndex === -1) throw new Error("parent does not exist");

  //     workingData[parentIndex].channels.text.push(newChannel);

  //     return workingData;
  //   });

  //   // add to chatData
  //   setChatData((currentData) => {
  //     const workingData = { ...currentData };

  //     workingData[parent._id][newChannel._id] = [];

  //     return workingData;
  //   });
  // }

  // // to be used when deleting a group
  // function removeGroup(removedGroupId) {
  //   // accept an id string
  //   // remove from groupData
  //   setGroupData((currentData) => {
  //     const workingData = [...currentData];
  //     const index = workingData.findIndex(
  //       (group) => group._id === removedGroupId
  //     );

  //     workingData.splice(index, 1);

  //     return workingData;
  //   });

  //   // remove from chatData
  //   setChatData((currentData) => {
  //     const workingData = { ...currentData };
  //     delete workingData[removedGroupId];
  //     return workingData;
  //   });
  // }

  // // to be used when deleting a channel
  // function removeChannel(parentId, removedChannelId) {
  //   // accept an id string
  //   // remove from groupData
  //   setGroupData((currentData) => {
  //     const workingData = [...currentData];
  //     const parentIndex = workingData.findIndex(
  //       (group) => group._id === parentId
  //     );
  //     const channelIndex = workingData[parentIndex].channel.text.findIndex(
  //       (channel) => channel._id === removedChannelId
  //     );

  //     workingData[parentIndex].channel.text.splice(channelIndex, 1);

  //     return workingData;
  //   });

  //   // remove from chatData
  //   setChatData((currentData) => {
  //     const workingData = { ...currentData };
  //     delete workingData[parentId][removedChannelId];
  //     return workingData;
  //   });
  // }

  const dataState = {
    groupData,
    setGroupData,
    groupMounted,
    setGroupMounted,
    isLoggedIn,
    setIsLoggedIn,
    chatData,
    setChatData,
    // addGroup,
    // addChannel,
    // removeGroup,
    // removeChannel,
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
