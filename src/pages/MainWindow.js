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

  useEffect(() => {
    if (!isLoggedIn && !localStorage.username) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // ? if the local message stack is not the same as in context, copy it
    // todo better comparison conditions
    if (messages.length > 0) {
      if (
        messages[0] !== messageStack[0] ||
        messages.length !== messageStack.length
      ) {
        setMessageStack([...messages]);
        setMessages([]);
      }
    }
  });

  function unmountFlash(position) {
    const messagesHelper = [...messageStack]; // ? spread the array to create a new array instead of saving the pointer?
    messagesHelper.splice(position, 1);

    setMessageStack(messagesHelper);
    // setMessages(messagesHelper); // if the content of an array is updated but the pointer stays the same react sees that as not a change thus will not rerender
  }

  return (
    <>
      <FlashMessageWrapper>
        {messageStack?.map((message) => {
          const position = messageStack.indexOf(message);
          return (
            <FlashMessage
              type={message.type}
              message={message.message}
              key={position}
              position={position}
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
