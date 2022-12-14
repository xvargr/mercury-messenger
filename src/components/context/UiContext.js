import { useState, createContext, useEffect } from "react";

// utility hooks
import useLocalFallback from "../../utils/localFallback";

export const UiContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function UiStateProvider(props) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [windowIsFocused, setWindowIsFocused] = useState(true);
  const { updateStored } = useLocalFallback();

  // backup each time context changes
  useEffect(() => {
    if (selectedGroup) updateStored.group(selectedGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // backup each time context changes
  useEffect(() => {
    if (selectedChannel) updateStored.channel(selectedChannel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannel]);

  function isAdmin() {
    return selectedGroup?.administrators.some(
      (admin) => admin._id === localStorage.userId
    );
  }

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
    isAdmin,
  };

  return (
    <UiContext.Provider value={uiStates}>{props.children}</UiContext.Provider>
  );
}
