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

  // states
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // refs
  const topOfPageRef = useRef(null);
  const bottomOfPageRef = useRef(null);
  const chatWindowRef = useRef(null);

  // scrollRefs
  const scrollElapsedRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const scrollPositionRef = useRef(null);

  // intersection-observer
  const [bottomVisibleRef, bottomOfPageIsVisible] = useInView();

  // custom hooks
  const { sendMessage, appendMessage, fetchMore } = useSocket();

  // memos
  const memoizedSkeleton = useMemo(() => <ChatSkeletonLoader count={15} />, []);

  // scroll to bottom on every new message if already latched to the bottom,
  function goToBottom(params) {
    if (params?.smooth) {
      bottomOfPageRef.current.scrollIntoView({
        block: "end",
        inline: "start",
      });
    } else {
      const chatWindow = document.querySelector("#chatWindow");

      chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: "instant",
      });
    }
  }

  // scroll to bottom on first load
  useEffect(() => {
    if (chatWindowRef.current) {
      goToBottom();
    }
  }, [dataReady, selectedChannel]);

  // scroll to bottom on new message if latched to the bottom
  useEffect(() => {
    if (bottomOfPageRef.current && bottomOfPageIsVisible) {
      goToBottom({ smooth: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // scroll position preservation on fetchMore
  useEffect(() => {
    const chatWindow = document.querySelector("#chatWindow");
    if (scrollPositionRef.current) {
      const newPosition = chatWindow.scrollHeight - scrollPositionRef.current;

      chatWindow.scrollTo({
        top: newPosition,
        behavior: "instant",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollPositionRef.current]);

  // rerender every 30 sec to update timestamps
  useEffect(() => {
    const rerenderInterval = setInterval(
      () => setLastUpdate(Date.now()),
      30000
    );
    return () => clearInterval(rerenderInterval);
  }, [lastUpdate]);

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
      goToBottom({ smooth: true });
    }
  }

  // fetch more messages on scroll to top, and save scroll position
  function handleScroll() {
    function setPositionOnTimeout() {
      scrollTimerRef.current = setTimeout(() => {
        scrollElapsedRef.current = null;

        if (chatWindowRef.current.scrollTop === 0 && !selectedChatIsDepleted) {
          fetchMore({
            target: {
              group: selectedGroup._id,
              channel: selectedChannel._id,
            },
            last: selectedGroup.chatData[selectedChannel._id][0]
              .clusterTimestamp,
          }).then(() => {
            scrollPositionRef.current = chatWindowRef.current.scrollHeight;
          });
        }
      }, 250);
    }

    // if timer is not set, set it
    if (!scrollElapsedRef?.current) {
      scrollElapsedRef.current = Date.now();
      setPositionOnTimeout();
    }

    // throttler, if time passed since last scroll evt <250ms ignore and reset scroll timer
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
              ref={topOfPageRef}
            >
              <Dots className="flex w-10 justify-around items-center p-0.5 fill-gray-500" />
            </div>
          )}

          <ChatStack />

          <GoToBottomButton
            visible={bottomOfPageIsVisible}
            passOnClick={() => goToBottom({ smooth: true })}
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
