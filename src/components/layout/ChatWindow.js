import { useEffect, useState, useMemo, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
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
  const { groupMounted, chatData /*, setChatData*/ } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { sendMessage, appendMessage } = useSocket();
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const endStopRef = useRef();
  const thisChatStack = useMemo(() => {
    return chatData && selectedGroup && selectedChannel
      ? chatData[selectedGroup._id][selectedChannel._id]
      : null;
  }, [chatData, selectedGroup, selectedChannel]);

  useEffect(() => {
    // scroll to bottom on every new message
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

  function renderClusters(stack) {
    const clusterStack = [];

    function renderMessages(cluster) {
      const content = cluster.content;
      const messageStack = [];
      // todo support content other than text
      let isGenesis = true;
      const someFailed = content.some((message) => message?.failed);
      const genesisFailed = content[0].failed;

      let retryObject;
      if (isGenesis && someFailed) {
        retryObject = {
          genesisFailed: genesisFailed ? true : false,
          clusterData: cluster,
          actions: {
            sendMessage,
            appendMessage,
            remove: null,
          },
          // someFailed,
        };
      } else retryObject = null;

      if (someFailed) {
        const failIndexes = [];
        console.log(content);
        // debugger;
        const failedMessages = content.filter((message) => message.failed);
        console.log(failedMessages);

        failedMessages.forEach((failedMessage) => {
          const index = failedMessages.findIndex(
            (message) => message.timestamp === failedMessage.timestamp
          );
          failIndexes.push(index);
        });

        console.log(failIndexes);

        retryObject.failIndexes = failIndexes; // ! here, working on parent only retry <------!!!!
      }

      // ! only retry parent

      content.forEach((message) => {
        // some messages can be null if saved out of order, so check
        if (message) {
          console.log("rendering message");
          messageStack.push(
            <Message
              key={message.timestamp}
              pending={message._id ? false : true}
              failed={message.failed} // ? change to boolean
              // retry={isGenesis ? { sendMessage, appendMessage } : null}
              // remove={null}
              retryObject={retryObject}
              // isGenesis={isGenesis}
              // genesisFailed={genesisFailed ? true : false}
              // someFailed={someFailed}
              // clusterData={isGenesis ? cluster : null}
            >
              {message.text}
            </Message>
          );
        }
        isGenesis = isGenesis ? false : true;
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
