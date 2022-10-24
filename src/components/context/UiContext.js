import { useState, createContext } from "react";
export const UiContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function UiStateProvider(props) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [windowIsFocused, setWindowIsFocused] = useState(true);

  function clearSelected() {
    setSelectedChannel(null);
    setSelectedGroup(null);
  }

  const uiStates = {
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
