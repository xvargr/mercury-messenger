import { useState, createContext, useEffect, useRef } from "react";

// utility hooks
import useLocalFallback from "../../utils/localFallback";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupData, setGroupData] = useState(null);
  const [peerData, setPeerData] = useState({});

  const [dataMounted, setDataMounted] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [selectedChatIsDepleted, setSelectedChatIsDepleted] = useState(true);
  const [stateRestored, setStateRestored] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [windowIsFocused, setWindowIsFocused] = useState(true);
  const [statusForced, setStatusForced] = useState(false);

  const { updateStored } = useLocalFallback();

  // this ref is used to prevent stale closure in the helper functions below
  const groupDataRef = useRef(groupData);
  useEffect(() => {
    groupDataRef.current = groupData;
  }, [groupData]);

  // backup selected context id on change
  useEffect(() => {
    if (selectedGroup) updateStored.group(selectedGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);
  useEffect(() => {
    if (selectedChannel) updateStored.channel(selectedChannel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannel]);

  // chatDepleted status updater
  useEffect(() => {
    if (!selectedGroup || !selectedChannel || !dataReady)
      setSelectedChatIsDepleted(false);
    else if (groupData[selectedGroup] !== selectedGroup) {
      // console.warn(groupData[selectedGroup._id]);
      // console.warn("chatMounted", chatMounted);
      const isDepleted =
        groupData[selectedGroup._id].chatDepleted[selectedChannel._id] || false;
      setSelectedChatIsDepleted(isDepleted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannel, groupData]);

  // todo change selected context if main grpData changes

  // window is focused detection used for notification sounds
  useEffect(() => {
    window.addEventListener("focus", () => setWindowIsFocused(true));
    window.addEventListener("blur", () => setWindowIsFocused(false));
    return () => {
      window.addEventListener("focus", () => setWindowIsFocused(true));
      window.addEventListener("blur", () => setWindowIsFocused(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set if everything is ready to show
  useEffect(() => {
    if (dataMounted && chatMounted && stateRestored) setDataReady(true);
    else setDataReady(false);
  }, [dataMounted, chatMounted, stateRestored]);

  function isAdmin() {
    return selectedGroup?.administrators.some(
      (admin) => admin._id === localStorage.userId
    );
  }

  function clearSelected() {
    setSelectedChannel(null);
    setSelectedGroup(null);
  }

  function mountChat(chatObject, depletedObject) {
    setGroupData((prevData) => {
      const dataCopy = { ...prevData };

      for (const groupId in chatObject) {
        dataCopy[groupId].chatData = { ...chatObject[groupId] };
      }

      for (const groupId in depletedObject) {
        dataCopy[groupId].chatDepleted = { ...depletedObject[groupId] };
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

  function changeStatus(params) {
    const { target, change } = params;

    const validStatuses = ["online", "away", "busy", "offline"];
    if (!validStatuses.includes(change)) {
      throw new Error("invalid status parameter");
    }
    if (!target) throw new Error("no id passed");

    setPeerData((prevData) => {
      const dataCopy = { ...prevData };

      if (!dataCopy[target]) dataCopy[target] = { status: "offline" };
      dataCopy[target].status = change;

      return dataCopy;
    });
  } // TODO

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
    chatMounted,
    setChatMounted,
    isLoggedIn,
    setIsLoggedIn,
    peerData,
    setPeerData,
    dataReady,
    stateRestored,
    setStateRestored,
    mountChat,
    selectedGroup,
    setSelectedGroup,
    selectedChannel,
    setSelectedChannel,
    windowIsFocused,
    setWindowIsFocused,
    clearSelected,
    isAdmin,
    selectedChatIsDepleted,
    statusForced,
    setStatusForced,

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
