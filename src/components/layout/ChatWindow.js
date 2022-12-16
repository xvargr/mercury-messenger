import { useEffect, useState, useMemo, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";

// components
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
import GoToBottomButton from "../chat/GoToBottomButton";
import Dots from "../ui/Dots";

// context
import { DataContext } from "../context/DataContext";
import { ChatSkeletonLoader } from "../ui/SkeletonLoaders";

// utility hooks
import useSocket from "../../utils/socket";
import { ChatStack } from "../../utils/iterableComponents";

function ChatWindow() {
  const { channel } = useParams();

  // context
  const {
    dataReady,
    chatMounted,
    stateRestored,
    dataHelpers,
    selectedGroup,
    selectedChannel,
    selectedChatIsDepleted,
  } = useContext(DataContext);

  console.log(stateRestored);
  console.log(selectedGroup);
  console.log(selectedChannel);

  // states
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  // const [topIntersected, setTopIntersected] = useState(false);

  // refs
  const topOfPageRef = useRef(null);
  const bottomOfPageRef = useRef(null);
  const chatWindowRef = useRef(null);
  const fetchTimerRef = useRef(null);

  // scrollRefs
  const scrollElapsedRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const scrollPositionRef = useRef(null);

  // intersection-observer
  const [topVisibleRef, topOfPageIsVisible] = useInView();
  const [bottomVisibleRef, bottomOfPageIsVisible] = useInView();

  // misc
  const { sendMessage, appendMessage, fetchMore } = useSocket();

  // memoized
  const memoizedSkeleton = useMemo(() => <ChatSkeletonLoader count={15} />, []);

  // const chatIsDepleted = useMemo(() => {
  //   if (selectedChannel) {
  //     console.log("refreshing depletion");
  //     console.log(selectedGroup);
  //     return selectedGroup.chatDepleted[selectedChannel._id];
  //   } else return false;
  // }, [selectedChannel, selectedGroup]); // ? or should this be a context

  // console.log(selectedGroup);
  // console.log(chatIsDepleted);

  // scroll to bottom on first load
  useEffect(() => {
    if (chatWindowRef.current) {
      goToBottom();
      // const chatWindow = document.querySelector("#chatWindow");
      // chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [dataReady, selectedChannel]);

  // scroll to bottom on every new message if already latched to the bottom,
  function goToBottom() {
    // bottomOfPageRef.current.scrollIntoView();
    // const chatWindow = document.querySelector("#chatWindow");
    // chatWindow.scrollTop = chatWindow.scrollHeight;
    bottomOfPageRef.current.scrollIntoView({
      block: "end",
      inline: "start",
    });
  }

  useEffect(() => {
    // console.log("chatStack changed");
    if (bottomOfPageRef.current && bottomOfPageIsVisible) goToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // rerender every 30 sec to update timestamps
  useEffect(() => {
    const rerenderInterval = setInterval(
      () => setLastUpdate(Date.now()),
      30000
    );
    return () => clearInterval(rerenderInterval);
  }, [lastUpdate]);
  // console.log(topIntersected);

  // fetch more messages on scroll hit top of page
  useEffect(() => {
    if (topOfPageIsVisible && !selectedChatIsDepleted) {
      fetchTimerRef.current = setTimeout(() => {
        console.log("fetching");
        fetchMore({
          target: { group: selectedGroup._id, channel: selectedChannel._id },
          last: selectedGroup.chatData[selectedChannel._id][0].clusterTimestamp,
        });
      }, 1000);
    } else {
      // console.log("cancelling fetch");
      // console.log(fetchTimerRef);
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topOfPageIsVisible]);

  function sendOut(sendObj) {
    if (dataReady) {
      const { elapsed, lastCluster, lastSender } = dataHelpers.getLastInfo(
        selectedGroup._id,
        selectedChannel._id
      );
      if (elapsed > 60000 || lastSender !== localStorage.username) {
        sendMessage({
          message: sendObj,
          target: { group: selectedGroup._id, channel: selectedChannel._id },
        });
      } else if (elapsed < 60000 && lastSender === localStorage.username) {
        appendMessage({
          message: sendObj,
          parent: lastCluster,
          target: { group: selectedGroup._id, channel: selectedChannel._id },
        });
      }
      goToBottom();
    }
  }

  // save scroll position after set duration of last scroll event
  function handleScroll() {
    function setPositionOnTimeout() {
      scrollTimerRef.current = setTimeout(() => {
        // console.log("scroll pos set");
        // console.log(window.innerHeight);
        // console.log(documen);
        // console.dir(chatWindowRef.current);
        // console.dir(chatWindowRef.current.offsetHeight);
        // console.dir(chatWindowRef.current.scrollTopMax);
        // console.dir(
        // chatWindowRef.current.scrollHeight - chatWindowRef.offsetHeight
        // );
        // console.dir(chatWindowRef.current.scrollHeight);
        // * below is working
        console.log(
          chatWindowRef.current.scrollTop,
          "/",
          chatWindowRef.current.scrollHeight -
            chatWindowRef.current.offsetHeight
        );
        scrollPositionRef.current = chatWindowRef.current.scrollTop;
        scrollElapsedRef.current = null;
      }, 250);
    }

    // if timer is not set, set it
    if (!scrollElapsedRef?.current) {
      scrollElapsedRef.current = Date.now();
      setPositionOnTimeout();
    }

    // if time passed since last scroll evt <250ms ignore and reset timer
    else if (Date.now() - scrollElapsedRef.current < 250) {
      scrollElapsedRef.current = Date.now();
      clearTimeout(scrollTimerRef.current);
      setPositionOnTimeout();
    }
  }

  if (!dataReady || !chatMounted || !stateRestored) {
    return (
      <section className="w-full min-w-0 bg-gray-600 overflow-x-hidden flex flex-col relative">
        <ChannelBanner name={channel} />

        <div className="w-full flex-grow overflow-y-auto overflow-x-hidden scrollbar-dark scroll-smooth">
          {memoizedSkeleton}
        </div>
      </section>
    );
  } else {
    return (
      <section className="w-full min-w-0 bg-gray-600 overflow-x-hidden flex flex-col relative">
        {/* // firefox does not respect flex shrink without width min 0 ! */}

        <ChannelBanner name={selectedChannel.name} />

        <div
          className="w-full flex-grow overflow-y-auto overflow-x-hidden scrollbar-dark scroll-smooth"
          id="chatWindow"
          onScroll={() => handleScroll()}
          ref={chatWindowRef}
        >
          {selectedChatIsDepleted ? (
            <div className="w-full h-20 flex justify-center items-center opacity-40">
              no more messages
            </div>
          ) : (
            <div
              className="w-full h-20 flex justify-center items-center"
              ref={(el) => {
                topOfPageRef.current = el;
                topVisibleRef(el);
              }}
            >
              <Dots className="flex w-10 justify-around items-center p-0.5 fill-gray-500" />
            </div>
          )}

          <ChatStack />

          <GoToBottomButton
            visible={bottomOfPageIsVisible}
            passOnClick={goToBottom}
          />

          <div
            className="w-full h-28"
            ref={(el) => {
              bottomOfPageRef.current = el;
              bottomVisibleRef(el);
            }}
          ></div>

          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  }
}

export default ChatWindow;
