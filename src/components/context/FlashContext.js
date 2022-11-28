import { useState, createContext } from "react";
export const FlashContext = createContext();

export function FlashStateProvider(props) {
  const [flashMessages, setFlashMessages] = useState([]);

  function pushFlashMessage(messageArray) {
    setFlashMessages((prevMessages) => [...prevMessages, ...messageArray]);
  }

  const flashState = { flashMessages, setFlashMessages, pushFlashMessage };

  return (
    <FlashContext.Provider value={flashState}>
      {props.children}
    </FlashContext.Provider>
  );
}
