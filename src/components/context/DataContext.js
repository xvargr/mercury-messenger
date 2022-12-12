import { useState, createContext, useEffect, useRef } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupData, setGroupData] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [peerData, setPeerData] = useState(null);
  const [dataMounted, setDataMounted] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // this ref is used to prevent stale closure in the helper functions below
  const groupDataRef = useRef(groupData);
  useEffect(() => {
    groupDataRef.current = groupData;
  }, [groupData]);

  useEffect(() => {
    if (dataMounted && chatMounted) setDataReady(true);
    else setDataReady(false);
  }, [dataMounted, chatMounted]);

  // initialize chat data and peer data structure @ first load
  if (groupData && !initialized /*&& chatData === null*/) {
    for (const groupId in groupData) {
      groupData[groupId].chatData = {};
      groupData[groupId].channels.text.forEach(
        (channel) => (groupData[groupId].chatData[channel._id] = [])
      );
    }

    const initPeerData = {};

    setPeerData(initPeerData);
    setInitialized(true);
  }

  function mountChat(data) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };

      for (const groupId in data) {
        dataCopy[groupId].chatData = { ...data[groupId] };
      }
      return dataCopy;
    });

    setChatMounted(true);
  }

  function getChannelIndex(parentId, channelId) {
    const dataArray = groupDataRef.current ?? groupData;
    const result = dataArray[parentId].channels.text.findIndex(
      (channel) => channel._id === channelId
    );
    return result;
  }

  function addNewChat(groupIdString, channelIdString, chatData) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };

      dataCopy[groupIdString].chatData[channelIdString] = chatData
        ? chatData[groupIdString][channelIdString]
        : []; // assumes new empty chat if no data was passed

      return dataCopy;
    });
  }

  function addNewGroup(groupObject, chatData) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };

      dataCopy[groupObject._id] = groupObject;
      dataCopy[groupObject._id].chatData = {};

      return dataCopy;
    });

    groupObject.channels.text.forEach((channel) =>
      addNewChat(groupObject._id, channel._id, chatData)
    );
  }

  function removeGroup(groupIdString) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };
      delete dataCopy[groupIdString];
      return dataCopy;
    });
  }

  function patchGroup(groupObject) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };
      const chatCopy = { ...dataCopy[groupObject._id].chatData };

      dataCopy[groupObject._id] = groupObject;
      dataCopy[groupObject._id].chatData = chatCopy;

      return dataCopy;
    });
  }

  function getStatus(idString) {
    return peerData[idString]?.status || "offline";
  }

  function mergePeers(partialData) {
    setPeerData((prevData) => {
      return { ...prevData, ...partialData };
    });
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
    dataMounted,
    setDataMounted,
    isLoggedIn,
    setIsLoggedIn,
    peerData,
    setPeerData,
    dataReady,
    mount: { chat: mountChat },
    dataHelpers: {
      getChannelIndex,
      addNewGroup,
      removeGroup,
      patchGroup,
      getLastInfo,
      mergePeers,
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
