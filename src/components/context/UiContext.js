import { useState, createContext, useEffect } from "react";
// import { DataContext } from "../context/DataContext";

// utility hooks
import useLocalFallback from "../../utils/localFallback";

export const UiContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function UiStateProvider(props) {
  // const { dataHelpers } = useContext(DataContext)
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [windowIsFocused, setWindowIsFocused] = useState(true);
  // const groupDataRef = useRef;
  const { updateStored, retrieveStored } = useLocalFallback();

  useEffect(() => {
    // console.log("effect store trig");
    if (selectedGroup) updateStored.group(selectedGroup);
    // console.log(retrieveStored);
    // console.log(retrieveStored.groupId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  useEffect(() => {
    // console.log("effect store trig");
    if (selectedChannel) updateStored.channel(selectedChannel);
    // retrievedStored.groupId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannel]);

  function isAdmin() {
    return selectedGroup.administrators.some(
      (admin) => admin._id === localStorage.userId
    );
  }

  // function setCurrentGroup(groupObject) {
  //   if (groupObject === null) setSelectedGroup(null);
  //   else {
  //     setSelectedGroup(groupObject);
  //     localStorage.setItem("lastGroup", groupObject._id);
  //   }
  // }

  // function setCurrentChannel(channelObject) {
  //   if (channelObject === null) setSelectedChannel(null);
  //   else {
  //     setSelectedChannel(channelObject);
  //     localStorage.setItem("lastChannel", channelObject._id);
  //   }
  // }

  // function currentGroup() {
  //   if (selectedGroup)
  //     return selectedGroup; // best case, if already stored in context
  //   else if (!localStorage.lastGroup) return null; // else fall back to localStorage if available
  //   console.log("here");
  //   // console.log(localStorage.lastGroup);
  //   return dataHelpers.getGroupDataFromId(localStorage.lastGroup);
  // }

  // function currentChannel() {
  //   if (selectedChannel)
  //     return selectedChannel; // best case, if already stored in context
  //   else if (!localStorage.lastChannel) return null; // else fall back to localStorage if available

  //   return dataHelpers.getChannelDataFromId(localStorage.lastChannel);
  // }

  // function clearCurrentGroup() {
  //   setSelectedGroup(null);
  // }
  // function clearCurrentChannel() {
  //   setSelectedChannel(null);
  // }

  function clearSelected() {
    setSelectedChannel(null);
    setSelectedGroup(null);
    // localStorage.removeItem("lastGroup");
    // localStorage.removeItem("lastChannel");
  }

  const uiStates = {
    // currentGroup,
    // currentChannel,
    // currentGroup: currentGroup(),
    // currentChannel: currentChannel(),
    // setCurrentGroup,
    // setCurrentChannel,
    // clearCurrentGroup,
    // clearCurrentChannel,
    selectedGroup,
    setSelectedGroup,
    selectedChannel,
    setSelectedChannel,
    windowIsFocused,
    setWindowIsFocused,
    clearSelected,
    isAdmin,
  };

  return (
    <UiContext.Provider value={uiStates}>{props.children}</UiContext.Provider>
  );
}
