import { useState, createContext } from "react";
export const ReplyContext = createContext();

export function RepliesStateProvider(props) {
  const [reply, setReply] = useState(null);

  function clearReply() {
    setReply(null);
  }

  const repliesState = {
    getReply: reply,
    setReply,
    clearReply,
  };

  return (
    <ReplyContext.Provider value={repliesState}>
      {props.children}
    </ReplyContext.Provider>
  );
}
