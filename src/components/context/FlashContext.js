import { useState, createContext } from "react";
export const FlashContext = createContext();

export function FlashStateProvider(props) {
  const [flashMessages, setFlashMessages] = useState([]);
  const flashState = { flashMessages, setFlashMessages };

  return (
    <FlashContext.Provider value={flashState}>
      {props.children}
    </FlashContext.Provider>
  );
}
