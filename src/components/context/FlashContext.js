import { useState, createContext } from "react";
export const FlashContext = createContext();

export function FlashStateProvider(props) {
  const [messages, setMessages] = useState([
    // { type: "error", message: "this is an error message" },
    // { type: "alert", message: "this is an alert message" },
    // { type: "success", message: "this is a success message" },
    // {
    //   type: "error",
    //   message:
    //     "this is a veeeerry loooooong errror rooroorooroo oro roo roor oro oror message",
    // },
  ]);
  const flashState = { messages, setMessages };

  // ? message schema
  // message = {
  //     type: enum["alert", "success", "error"],
  //     message: "string"
  // }

  return (
    <FlashContext.Provider value={flashState}>
      {props.children}
    </FlashContext.Provider>
  );
}
