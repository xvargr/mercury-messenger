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
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";
import { SocketContext } from "../components/context/SocketContext";

// utility
import axiosInstance from "../utils/axios";
import useStateRestore from "../utils/restoreState";

function MainWindow() {
  const navigate = useNavigate();
  const { socketIsConnected, disconnectSocket } = useContext(SocketContext);
  const { setWindowIsFocused } = useContext(UiContext);
  const { dataReady, isLoggedIn, setIsLoggedIn } = useContext(DataContext);
  const { flashMessages, setFlashMessages } = useContext(FlashContext);
  const [messageStack, setMessageStack] = useState([]);
  const { abortAll } = axiosInstance();

  useStateRestore();

  // redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn && !localStorage.username) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // // force disconnect socket on refresh, without this, sometimes socket is still marked connected after refresh and will infinitely wait for reconnection
  // useEffect(() => {
  //   window.onbeforeunload = function () {
  //     disconnectSocket();
  //   };

  //   return () => {
  //     window.onbeforeunload = null;
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // ! store last grp/ch in local? load them back here?
  // useEffect(() => {
  //         // localStorage.setItem("lastGroup", groupObject._id);

  //         // localStorage.setItem("lastChannel", channelObject._id);

  //   // return () => {
  //   //   second
  //   // }
  // }, [selectedGroup, selectedChannel])

  // load flash messages if any
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  });

  // window is focused detection used for notification sounds
  useEffect(() => {
    window.addEventListener("focus", () => setWindowIsFocused(true));
    window.addEventListener("blur", () => setWindowIsFocused(false));
    return () => {
      window.addEventListener("focus", () => setWindowIsFocused(true));
      window.addEventListener("blur", () => setWindowIsFocused(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // axios abort cleanup
  useEffect(() => {
    return () => {
      abortAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function unmountFlash(position) {
    const messagesHelper = [...messageStack]; //  spread the array to create a new array instead of saving the pointer
    messagesHelper.splice(position, 1);

    setMessageStack(messagesHelper);
  }

  return (
    <main className="w-screen h-screen font-nunito overflow-hidden flex justify-center bgHeroTopo">
      <ReconnectingModal isReconnecting={!socketIsConnected || !dataReady} />
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
    </main>
  );
}

export default MainWindow;
