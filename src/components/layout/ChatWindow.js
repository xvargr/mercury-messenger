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
import { UiContext } from "../context/UiContext";
import { ChatSkeletonLoader } from "../ui/SkeletonLoaders";

// utility hooks
import useSocket from "../../utils/socket";
import { ChatStack } from "../../utils/iterableComponents";

function ChatWindow() {
  const { channel } = useParams();

  // context
  const { dataReady, chatMounted, dataHelpers } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);

  // states
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  // const [topIntersected, setTopIntersected] = useState(false);

  // refs
  const topOfPageRef = useRef(null);
  const bottomOfPageRef = useRef(null);
  const chatWindowRef = useRef(null);

  // scrollRefs
  const scrollElapsedRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const scrollPositionRef = useRef(null);

  // intersection-observer
  const [topVisibleRef, topOfPageIsVisible] = useInView();
  const [bottomVisibleRef, bottomOfPageIsVisible] = useInView();

  // misc
  const { sendMessage, appendMessage, fetchMore } = useSocket();

  const memoizedSkeleton = useMemo(() => <ChatSkeletonLoader count={15} />, []);

  // scroll to bottom on first load
  useEffect(() => {
    // console.log(chatWindowRef.current);
    if (chatWindowRef.current) {
      console.log("LLLLLLLLLL");
      // chatWindowRef.current?.scrollHeight = 0
      const chatWindow = document.querySelector("#chatWindow");
      console.log(chatWindow);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [dataReady]);

  // scroll to bottom on every new message if already latched to the bottom,
  function goToBottom() {
    // bottomOfPageRef.current.scrollIntoView();
    bottomOfPageRef.current.scrollIntoView({
      block: "end",
      inline: "start",
    });
  }

  // useEffect(() => {
  //   if (bottomOfPageRef.current && bottomOfPageIsVisible) goToBottom();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [thisChatStack]);

  // rerender every 30 sec to update timestamps
  useEffect(() => {
    const rerenderInterval = setInterval(
      () => setLastUpdate(Date.now()),
      30000
    );
    return () => clearInterval(rerenderInterval);
  }, [lastUpdate]);
  // console.log(topIntersected);

  // fetch more messages on scroll hit top of page, scroll to bottom on first load
  useEffect(() => {
    if (topOfPageIsVisible) {
      console.log("fetching");

      // ! timer before fetch?
      setTimeout(() => {
        // fetchMore({
        //   target: { group: selectedGroup._id, channel: selectedChannel._id },
        //   last: chatData[selectedGroup._id][selectedChannel._id][0]
        //     .clusterTimestamp,
        // });
      }, 100);
    }
    // else if (chatMounted && !topIntersected) { // !!!! WHYYYY
    //   setTopIntersected(true);
    //   goToBottom();
    // }
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
        console.dir(chatWindowRef.current.scrollTopMax);
        // console.dir(
        // chatWindowRef.current.scrollHeight - chatWindowRef.offsetHeight
        // );
        // console.dir(chatWindowRef.current.scrollHeight);
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

  if (!dataReady || !chatMounted) {
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
          <div
            className="w-full h-20 flex justify-center items-center"
            ref={(el) => {
              topOfPageRef.current = el;
              topVisibleRef(el);
            }}
          >
            <Dots className="flex w-10 justify-around items-center p-0.5 fill-gray-500" />
          </div>

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
