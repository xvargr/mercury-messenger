import { React, useContext, useEffect } from "react";
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

  // messages.forEach();

  useEffect(() => {
    if (!isLoggedIn && !localStorage.username) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // useEffect(() => {
  //   effect

  // }, []);
  function unmountFlash(position) {
    // console.log("hello");
    // console.log(position);
    const messagesHelper = messages;
    messagesHelper.splice(position, 1);
    setMessages(messagesHelper);
  }
  console.log(messages);

  return (
    <>
      <FlashMessageWrapper>
        {messages?.map((message) => (
          <FlashMessage
            type={message.type}
            message={message.message}
            key={messages.indexOf(message)}
            position={messages.indexOf(message)}
            unmount={unmountFlash}
          />
        ))}
      </FlashMessageWrapper>
      <GroupsBar />
      <Outlet />
    </>
  );
}

export default MainWindow;
