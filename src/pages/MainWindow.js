import { React, useContext, useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import GroupsBar from "../components/layout/GroupsBar";
import { DataContext } from "../components/context/DataContext";
import {
  FlashMessageWrapper,
  FlashMessage,
} from "../components/ui/FlashMessage";

import { FlashContext } from "../components/context/FlashContext";

function MainWindow() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(DataContext);
  const { messages, setMessages } = useContext(FlashContext);
  const [messageStack, setMessageStack] = useState([]);

  // messages.forEach();

  useEffect(() => {
    if (!isLoggedIn && !localStorage.username) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // useEffect(() => {
  //   setMessages([
  //     { type: "error", message: "this is an error message" },
  //     { type: "alert", message: "this is an alert message" },
  //     { type: "success", message: "this is a success message" },
  //     {
  //       type: "error",
  //       message:
  //         "this is a veeeerry loooooong errror rooroorooroo oro roo roor oro oror message",
  //     },
  //   ]);
  // }, []);

  useEffect(() => {
    console.log("msgCont", messages);
    console.log("msgStack", messageStack);

    // console.log(messages.length > 0 && messageStack.length === 0);
    // if (messages.length > 0 && messageStack.length === 0) {
    //   console.log("stack set");
    //   setMessageStack([...messages]);
    // }
    if (
      messages[0] !== messageStack[0] ||
      messages.length !== messageStack.length
    ) {
      console.log("stack set");
      setMessageStack([...messages]);
    }
  });

  console.log("mainwindowrerendered");

  // ! BUG / if there are multiple messages, rerender doesn't work properly, messages disappear after rerender
  function unmountFlash(position) {
    console.log("updating messages");
    // console.log(position); // todo fix this
    // const y = messages;
    // const x = y.splice(position, 1);
    // console.log(x);
    // console.log(y);
    // const messagesHelper = messageStack; // ! %1%
    const messagesHelper = [...messageStack]; // ? spread the array to create a new array instead of saving the pointer?
    messagesHelper.splice(position, 1);

    console.log("messagesHelper", messagesHelper.length);
    setMessageStack(messagesHelper);
    setMessages(messagesHelper); // ! does not trigger rerender // bcs the pointer points to the same array, react sees that as no change, see %1%
  }
  // console.log("messages state", messages);

  return (
    <>
      <FlashMessageWrapper>
        {messageStack?.map((message) => {
          console.log("hello");
          const position = messageStack.indexOf(message);
          let fadeThis = position === 0 ? true : false;
          return (
            <FlashMessage
              type={message.type}
              message={message.message}
              key={position}
              fadeThis={fadeThis}
              unmount={unmountFlash}
            />
          );
        })}
      </FlashMessageWrapper>
      <GroupsBar />
      <Outlet />
    </>
  );
}

export default MainWindow;
