import { useEffect, useState, useMemo, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";

// components
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
import Sender from "../chat/SenderWrapper";
import Message from "../chat/Message";
import GoToBottomButton from "../chat/GoToBottomButton";
import Dots from "../ui/Dots";

// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
import { ChatSkeletonLoader } from "../ui/SkeletonLoaders";

// utility hooks
import useSocket from "../../utils/socket";

function ChatWindow() {
  const { channel } = useParams();

  // context
  const { groupMounted, chatMounted, groupData, chatData, dataHelpers } =
    useContext(DataContext);
  const { selectedGroup, selectedChannel, setSelectedChannel } =
    useContext(UiContext);

  // states
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [topIntersected, setTopIntersected] = useState(false);

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
  const navigate = useNavigate();

  // stores the chat stack, used to detect changes in this chat specifically
  const thisChatStack = useMemo(() => {
    return chatMounted && selectedGroup && selectedChannel
      ? dataHelpers.renderChatStack({
          target: {
            groupId: selectedGroup._id,
            channelId: selectedChannel._id,
          },
          actions: { sendMessage, appendMessage },
          components: { Sender, Message },
        })
      : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMounted, chatData, selectedGroup, selectedChannel]);

  // preserve selected channel on refresh
  const channelFound = useMemo(() => {
    const groupIndex =
      groupData && selectedGroup
        ? dataHelpers.getGroupIndex(selectedGroup._id)
        : null;

    if (groupData && groupIndex !== null && groupIndex >= 0) {
      return groupData[groupIndex].channels.text.find(
        (grp) => grp.name === channel
      );
    } else return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, groupData, selectedGroup]);

  // ! A bit messy with this many useEffects

  // redirect and refresh position preservation
  useEffect(() => {
    if (groupMounted && selectedGroup) {
      if (channelFound === undefined) navigate("/404");
      else if (channelFound) setSelectedChannel(channelFound);
      else if (!selectedGroup) navigate("/");
    }
    return () => setTopIntersected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMounted, chatMounted, channelFound]);

  // scroll to bottom on every new message if already latched to the bottom,
  function goToBottom() {
    // bottomOfPageRef.current.scrollIntoView();
    bottomOfPageRef.current.scrollIntoView({
      block: "end",
      inline: "start",
    });
  }
  useEffect(() => {
    if (bottomOfPageRef.current && bottomOfPageIsVisible) goToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thisChatStack]);

  // rerender every 30 sec to update timestamps
  useEffect(() => {
    const rerenderInterval = setInterval(
      () => setLastUpdate(Date.now()),
      30000
    );
    return () => clearInterval(rerenderInterval);
  }, [lastUpdate]);
  console.log(topIntersected);

  // fetch more messages on scroll hit top of page, scroll to bottom on first load
  useEffect(() => {
    if (topOfPageIsVisible && topIntersected) {
      console.log("fetching");
      fetchMore({
        target: { group: selectedGroup._id, channel: selectedChannel._id },
        last: chatData[selectedGroup._id][selectedChannel._id][0]
          .clusterTimestamp,
      });
    }
    // else if (chatMounted && !topIntersected) { // !!!! WHYYYY
    //   setTopIntersected(true);
    //   goToBottom();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topOfPageIsVisible]);

  // useEffect(() => {
  //   if (bottomOfPageRef?.current) {
  //     setTopIntersected(true);
  //     goToBottom();
  //   }
  // }, [chatMounted]);

  function sendOut(sendObj) {
    if (groupMounted) {
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
        console.log("scroll pos set");
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

  if (!groupMounted || !chatMounted || !selectedChannel) {
    return (
      <section className="w-full min-w-0 bg-gray-600 overflow-x-hidden flex flex-col relative">
        <ChannelBanner name={channel} />

        <div className="w-full flex-grow overflow-y-auto overflow-x-hidden scrollbar-dark scroll-smooth">
          <ChatSkeletonLoader count={15} />

          <ChatInputBox return={null} />
        </div>
      </section>
    );
  } else {
    // dataHelpers.getGroupDataFromId(selectedGroup._id);
    // dataHelpers.getChannelDataFromId(selectedChannel._id);
    return (
      <section className="w-full min-w-0 bg-gray-600 overflow-x-hidden flex flex-col relative">
        {/* // firefox does not respect flex shrink without width min 0 ! */}
        <ChannelBanner name={selectedChannel.name} />
        <div
          className="w-full flex-grow overflow-y-auto overflow-x-hidden scrollbar-dark scroll-smooth"
          onScroll={() => handleScroll()}
          // onWheel={() => console.log("wheeling")}
          ref={chatWindowRef}
        >
          {thisChatStack.length > 0 ? (
            <div
              className="w-full h-20 flex justify-center items-center"
              ref={(el) => {
                topOfPageRef.current = el;
                topVisibleRef(el);
              }}
            >
              <Dots className="flex w-10 justify-around items-center p-0.5 fill-gray-500" />
            </div>
          ) : null}

          {thisChatStack}

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
