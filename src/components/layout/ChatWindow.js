import { useEffect, useState, useMemo, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components
import ChatInputBox from "../chat/ChatInputBox";
import ChannelBanner from "../chat/ChatBanner";
import Sender from "../chat/SenderWrapper";
import Message from "../chat/Message";

// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
import { ChatSkeletonLoader } from "../ui/SkeletonLoaders";

// utility hooks
import useSocket from "../../utils/socket";

function ChatWindow() {
  const { channel } = useParams();
  const { groupMounted, groupData, chatData, getGroupIndex } =
    useContext(DataContext);
  const { selectedGroup, selectedChannel, setSelectedChannel } =
    useContext(UiContext);
  const { sendMessage, appendMessage } = useSocket();
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const endStopRef = useRef();
  const navigate = useNavigate();

  const thisChatStack = useMemo(() => {
    return chatData && selectedGroup && selectedChannel
      ? chatData[selectedGroup._id][selectedChannel._id]
      : null;
  }, [chatData, selectedGroup, selectedChannel]);

  const channelFound = useMemo(() => {
    const groupIndex = groupData ? getGroupIndex(selectedGroup?._id) : null;
    if (groupData && groupIndex >= 0)
      return groupData[groupIndex].channels.text.find(
        (grp) => grp.name === channel
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, groupData]);

  // redirect and refresh position preservation
  useEffect(() => {
    if (groupMounted) {
      if (!channelFound) navigate("/404");
      else {
        setSelectedChannel(channelFound);
      }
      if (!selectedGroup) navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMounted]);

  // scroll to bottom on every new message
  useEffect(() => {
    if (endStopRef.current) {
      endStopRef.current.scrollIntoView();
    }
  }, [chatData]);

  // rerender every 30 sec, for updating timestamps
  useEffect(() => {
    const rerenderInterval = setInterval(
      () => setLastUpdate(Date.now()),
      30000
    );
    return () => clearInterval(rerenderInterval);
  }, [lastUpdate]);

  function sendOut(sendObj) {
    if (groupMounted) {
      const { elapsed, lastCluster, lastSender } = getLastInfo();
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
    }

    function getLastInfo() {
      const elapsed =
        thisChatStack.length > 0
          ? Date.now() -
            thisChatStack[thisChatStack.length - 1].clusterTimestamp
          : 0;

      const lastSender =
        thisChatStack.length > 0
          ? thisChatStack[thisChatStack.length - 1].sender.username
          : null;

      const lastCluster =
        thisChatStack.length > 0
          ? thisChatStack[thisChatStack.length - 1]
          : null;

      return { elapsed, lastCluster, lastSender };
    }
  }

  // renders every cluster in the current chat
  function renderClusters(stack) {
    const clusterStack = [];

    // renders the sender/cluster wrapper
    function renderMessages(cluster) {
      // todo support content other than text
      const content = cluster.content;
      const messageStack = [];
      const someFailed = content.some((message) => message?.failed);
      let isGenesis = true;
      let retryObject = null;

      // creates object with all necessary information for a retry if any failed
      if (someFailed) {
        retryObject = {
          // genesisFailed: content[0].failed ? true : false,
          clusterData: cluster,
          actions: {
            sendMessage,
            appendMessage,
            remove: null,
          },
          failedIndex: content.reduce((result, message, index) => {
            if (message.failed) result.push(index);
            return result;
          }, []),
        };
      }

      // renders the individual messages in the cluster
      content.forEach((message) => {
        // some messages can be null if saved out of order, so check
        if (message) {
          messageStack.push(
            <Message
              key={message.timestamp}
              pending={message._id ? false : true}
              failed={message.failed} // indicates fails on messages
              retryObject={isGenesis ? retryObject : null} // enables retry actions on genesis message if any child failed
            >
              {message.text}
            </Message>
          );
        }
        if (isGenesis) isGenesis = false;
      });
      return messageStack;
    }

    stack.forEach((cluster) => {
      clusterStack.push(
        <Sender
          sender={cluster.sender}
          timestamp={cluster.clusterTimestamp}
          key={cluster.clusterTimestamp}
          pending={cluster._id ? false : true}
        >
          {renderMessages(cluster)}
        </Sender>
      );
    });
    return clusterStack;
  }

  // todo fetch more if scroll up

  // todo back to current button

  if (!groupMounted || !thisChatStack) {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={channel} />

        <div className="w-full flex-grow overflow-y-hidden">
          <ChatSkeletonLoader count={15} />

          <ChatInputBox return={null} />
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={selectedChannel.name} />

        <div className="w-full flex-grow overflow-y-scroll scrollbar-dark scroll-smooth">
          {renderClusters(thisChatStack)}
          <div className="w-full h-28" ref={endStopRef}></div>
          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  }
}

export default ChatWindow;
