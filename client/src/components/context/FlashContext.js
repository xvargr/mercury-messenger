import { useState, useEffect, createContext } from "react";
export const FlashContext = createContext();

export function FlashStateProvider(props) {
  const [flashMessages, setFlashMessages] = useState([]);
  const [messageStack, setMessageStack] = useState([]);

  // if flash messages are received, move them to the temp array context to be rendered and shown
  useEffect(() => {
    // if the local message stack is not the same as in context, move it
    if (flashMessages.length > 0) {
      if (
        flashMessages[0] !== messageStack[0] ||
        flashMessages.length !== messageStack.length
      ) {
        setMessageStack((prevMessages) => [...prevMessages, ...flashMessages]);
        setFlashMessages([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashMessages]);

  function pushFlashMessage(messageArray) {
    setFlashMessages((prevMessages) => [...prevMessages, ...messageArray]);
  }

  function unmountFlash(position) {
    const messagesHelper = [...messageStack]; //  spread the array to create a new array instead of saving the pointer
    messagesHelper.splice(position, 1);

    setMessageStack(messagesHelper);
  }

  const flashState = {
    flashMessages,
    setFlashMessages,
    pushFlashMessage,
    messageStack,
    unmountFlash,
  };

  return (
    <FlashContext.Provider value={flashState}>
      {props.children}
    </FlashContext.Provider>
  );
}
