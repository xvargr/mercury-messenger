import { useState, createContext, useContext } from "react";
import { DataContext } from "../context/DataContext";

export const UiContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function UiStateProvider(props) {
  const { dataHelpers } = useContext(DataContext);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [windowIsFocused, setWindowIsFocused] = useState(true);
  // const groupDataRef = useRef;

  function setCurrentGroup(groupObject) {
    if (groupObject === null) setSelectedGroup(null);
    else {
      setSelectedGroup(groupObject);
      localStorage.setItem("lastGroup", groupObject._id);
    }
  }

  function setCurrentChannel(channelObject) {
    if (channelObject === null) setSelectedChannel(null);
    else {
      setSelectedChannel(channelObject);
      localStorage.setItem("lastChannel", channelObject._id);
    }
  }

  function currentGroup() {
    if (selectedGroup)
      return selectedGroup; // best case, if already stored in context
    else if (!localStorage.lastGroup) return null; // else fall back to localStorage if available
    console.log("here");
    // console.log(localStorage.lastGroup);
    return dataHelpers.getGroupDataFromId(localStorage.lastGroup);
  }

  function currentChannel() {
    if (selectedChannel)
      return selectedChannel; // best case, if already stored in context
    else if (!localStorage.lastChannel) return null; // else fall back to localStorage if available

    return dataHelpers.getChannelDataFromId(localStorage.lastChannel);
  }

  // function clearCurrentGroup() {
  //   setSelectedGroup(null);
  // }
  // function clearCurrentChannel() {
  //   setSelectedChannel(null);
  // }

  function clearSelected() {
    setSelectedChannel(null);
    setSelectedGroup(null);
    localStorage.removeItem("lastGroup");
    localStorage.removeItem("lastChannel");
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
  };

  return (
    <UiContext.Provider value={uiStates}>{props.children}</UiContext.Provider>
  );
}
