import { React, useContext, useEffect, useState } from "react";
import { useNavigate, Outlet, useParams } from "react-router-dom";

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

// utility hooks
import axiosInstance from "../utils/axios";

function MainWindow() {
  const navigate = useNavigate();
  const { socketIsConnected, connectSocket } = useContext(SocketContext);
  const {
    setWindowIsFocused,
    setSelectedGroup,
    setSelectedChannel,
    selectedChannel,
    clearSelected,
  } = useContext(UiContext);
  const {
    isLoggedIn,
    setIsLoggedIn,
    // groupData,
    groupMounted,
    setGroupData,
    setGroupMounted,
  } = useContext(DataContext);
  const { flashMessages, setFlashMessages } = useContext(FlashContext);
  const [messageStack, setMessageStack] = useState([]);
  const { group, channel } = useParams();
  const { userGroups } = axiosInstance();

  // redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn && !localStorage.username) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // console.log("selectedChannel in main", selectedChannel?.name);

  // load flash messages if any
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // if the local message stack is not the same as in context, copy it
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

  // useEffect(() => { // !
  //   if (groupMounted && isLoggedIn && socketIsConnected === false) {
  //     connectSocket();
  //   } // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [groupMounted]);

  useEffect(() => {
    // if (!groupMounted && isLoggedIn) {
    // console.log("refetch");
    userGroups
      .fetch()
      .then((res) => {
        // console.log("refetch successful");
        const groupData = res.data;

        setGroupData(() => groupData);

        if (group) {
          const currentGroup = groupData.find((grp) => grp.name === group);
          setSelectedGroup(() => currentGroup);
          if (channel) {
            setSelectedChannel(() =>
              currentGroup.channels.text.find((chn) => chn.name === channel)
            );
          }
        }

        setGroupMounted(true);
      })
      .catch((e) => e); // axios abort throws error unless it's caught here
    // }
    return () => {
      // console.log("cleanup");
      userGroups.abortFetch(); // abort fetch on unmount
      clearSelected();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // abort axios request on unmount

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
