import { useState, createContext } from "react";
export const FlashContext = createContext();

export function FlashStateProvider(props) {
  const [flashMessages, setFlashMessages] = useState([]);

  function pushFlashMessage(params) {
    setFlashMessages((prevMessages) => [...prevMessages, ...params]);
  }

  const flashState = { flashMessages, setFlashMessages, pushFlashMessage };

  return (
    <FlashContext.Provider value={flashState}>
      {props.children}
    </FlashContext.Provider>
  );
}
