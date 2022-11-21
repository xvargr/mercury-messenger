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
  const { socketIsConnected } = useContext(SocketContext);
  const {
    setWindowIsFocused,
    setSelectedGroup,
    setSelectedChannel,
    clearSelected,
  } = useContext(UiContext);
  const {
    isLoggedIn,
    setIsLoggedIn,
    setGroupData,
    setGroupMounted,
    groupMounted,
  } = useContext(DataContext);
  const { flashMessages, setFlashMessages, pushFlashMessage } =
    useContext(FlashContext);
  const [messageStack, setMessageStack] = useState([]);
  const { group, channel } = useParams();
  const { userGroups } = axiosInstance();

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

  useEffect(() => {
    if (!groupMounted) {
      userGroups
        .fetch()
        .then((res) => {
          const groupData = res.data;
          setGroupData(() => groupData);
          setGroupMounted(true);

          if (group) {
            const currentGroup = groupData.find((grp) => grp.name === group);
            if (!currentGroup) {
              pushFlashMessage([
                { message: "Group does not exist", type: "error" },
              ]);
              setSelectedGroup(null);
              setSelectedChannel(null);
            } else setSelectedGroup(() => currentGroup);

            if (channel) {
              const currentChannel = currentGroup.find(
                (chn) => chn.name === channel
              );
              if (!currentChannel) {
                pushFlashMessage([
                  { message: "Channel does not exist", type: "error" },
                ]);
                setSelectedChannel(null);
                navigate(`/g/${setSelectedGroup.name}`);
              } else setSelectedChannel(() => currentChannel);
            }
          }
        })
        .catch((e) => e); // axios abort throws error unless it's caught here
    }
    return () => {
      userGroups.abortFetch(); // abort fetch on unmount
      clearSelected();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMounted]);

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
