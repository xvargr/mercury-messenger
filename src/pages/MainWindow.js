import { React, useContext, useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

// components
import GroupsBar from "../components/layout/GroupsBar";

// ui
import {
  FlashMessageWrapper,
  FlashMessage,
} from "../components/ui/FlashMessage";
import { ReconnectingModal } from "../components/ui/Modal";

// context
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";
import { SocketContext } from "../components/context/SocketContext";

function MainWindow() {
  const navigate = useNavigate();
  const { socketIsConnected } = useContext(SocketContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(DataContext);
  const { flashMessages, setFlashMessages } = useContext(FlashContext);
  const [messageStack, setMessageStack] = useState([]);

  // redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn && !localStorage.username) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // load flash messages if any
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // if the local message stack is not the same as in context, copy it
    // todo better comparison conditions
    if (flashMessages.length > 0) {
      if (
        flashMessages[0] !== messageStack[0] ||
        flashMessages.length !== messageStack.length
      ) {
        setMessageStack([...flashMessages]);
        setFlashMessages([]);
      }
    }
  });

  function unmountFlash(position) {
    const messagesHelper = [...messageStack]; //  spread the array to create a new array instead of saving the pointer
    messagesHelper.splice(position, 1);

    setMessageStack(messagesHelper);
  }

  return (
    <>
      <ReconnectingModal isReconnecting={!socketIsConnected} />
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
