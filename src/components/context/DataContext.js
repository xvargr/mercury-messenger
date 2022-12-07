import { useState, createContext, useEffect, useRef } from "react";

// import Sender from "../chat/SenderWrapper";
// import Message from "../chat/Message";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupData, setGroupData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [peerData, setPeerData] = useState(null);
  const [groupMounted, setGroupMounted] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // this ref is used to prevent stale closure in the helper functions below
  const groupDataRef = useRef(groupData);
  useEffect(() => {
    groupDataRef.current = groupData;
  }, [groupData]);

  // initialize chat data and peer data structure @ first load
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

  function getStatus(idString) {
    return peerData[idString]?.status || "offline";
  }

  function changeStatus(idString) {}

  function getLastInfo(groupId, channelId) {
    const chatStack = chatData[groupId][channelId];

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

  // renders every cluster in the current chat
  function renderChatStack(params) {
    const { target, actions, components } = params;
    const { groupId, channelId } = target;
    const { sendMessage, appendMessage } = actions;
    const { Sender, Message } = components;

    const chatStack = chatData[groupId][channelId];
    const group = groupData[getGroupIndex(groupId)];

    const clusterStack = [];
    const isUserAdmin = {};

    group.members.forEach((member) => {
      const isAdmin = group.administrators.some(
        (admin) => admin._id === member._id
      );
      isUserAdmin[member._id] = isAdmin ? true : false;
    });

    // renders the sender/cluster wrapper
    function renderMessages(cluster) {
      // todo support content other than text
      const content = cluster.content;
      const messageStack = [];
      const someFailed = content.some((message) => message?.failed);
      let isGenesis = true;
      let retryObject = null;

      // creates object with all necessary information for a retry if any failed
      if (someFailed) {
        retryObject = {
          // genesisFailed: content[0].failed ? true : false,
          clusterData: cluster,
          actions: {
            sendMessage,
            appendMessage,
            removeLocally: null,
          },
          failedIndex: content.reduce((result, message, index) => {
            if (message.failed) result.push(index);
            return result;
          }, []),
        };
      }

      // renders the individual messages in the cluster
      content.forEach((message) => {
        // some messages can be null if saved out of order, so check
        if (message) {
          messageStack.push(
            <Message
              key={message.timestamp}
              data={message.text}
              pending={message._id ? false : true}
              failed={message.failed} // indicates fails on messages
              retryObject={isGenesis ? retryObject : null} // enables retry actions on genesis message if any child failed
            />
          );
        }
        if (isGenesis) isGenesis = false;
      });
      return messageStack;
    }

    chatStack.forEach((cluster) => {
      // console.log(cluster);
      clusterStack.push(
        <Sender
          sender={cluster.sender}
          timestamp={cluster.clusterTimestamp}
          key={cluster.clusterTimestamp}
          pending={cluster._id ? false : true}
          isAdmin={isUserAdmin[cluster.sender._id]}
        >
          {renderMessages(cluster)}
        </Sender>
      );
    });
    return clusterStack;
  }

  const dataState = {
    groupData,
    setGroupData,
    setChatData,
    chatData,
    groupMounted,
    setGroupMounted,
    chatMounted,
    setChatMounted,
    isLoggedIn,
    setIsLoggedIn,
    peerData,
    setPeerData,
    dataHelpers: {
      getGroupIndex,
      getChannelIndex,
      addNewGroup,
      addNewChat,
      removeGroup,
      removeChat,
      patchGroup,
      getLastInfo,
      renderChatStack,
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
