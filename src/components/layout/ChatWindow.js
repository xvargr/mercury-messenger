import { useEffect, useState, useRef, useContext } from "react";
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
import { SocketContext } from "../context/SocketContext";

function ChatWindow() {
  const { channel } = useParams();
  const { groupMounted, chatData, setChatData } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { socket } = useContext(SocketContext);
  const [chatStack, setChatStack] = useState([]);
  const endStopRef = useRef();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // update the local chat stack on main chat data update
    if (groupMounted) {
      setChatStack(chatData[selectedGroup._id][selectedChannel._id]);
      // console.table(
      //   chatData[selectedGroup._id][selectedChannel._id][0]?.content
      // );
    }
  });

  useEffect(() => {
    // scroll to bottom on every new message
    if (endStopRef.current) endStopRef.current.scrollIntoView();
  }, [chatStack]);

  function sendOut(messageData) {
    const elapsed =
      chatStack.length > 0
        ? Date.now() - chatStack[chatStack.length - 1].clusterTimestamp
        : 0;

    const lastSender =
      chatStack.length > 0
        ? chatStack[chatStack.length - 1].sender.username
        : null;

    const lastCluster =
      chatStack.length > 0 ? chatStack[chatStack.length - 1] : null;

    // new cluster if last message is more than 1 min ago or someone else messaged since
    if (elapsed > 60000 || lastSender !== localStorage.username) {
      const genesisCluster = {
        target: { group: selectedGroup._id, channel: selectedChannel._id },
        data: messageData,
      };

      const pendingCluster = {
        sender: {
          username: localStorage.username,
          userImage: {
            thumbnailMedium: localStorage.userImageMedium,
          },
        },
        channel: {},
        content: [genesisCluster.data],
        clusterTimestamp: messageData.timestamp,
      };

      // ! don't use selected context
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        dataCopy[selectedGroup._id][selectedChannel._id].push(pendingCluster);
        return dataCopy;
      });

      function clusterAcknowledged(res) {
        console.log("clust event");
        setChatData((prevStack) => {
          // setState callback is used to access the latest pending state before rerender
          // spread so that the values instead of the pointer is referenced by the new variable
          // else state will see no change since the pointer doesn't change even if the values did
          // make a copy of the whole chatData and the specific chat being modified
          const dataCopy = { ...prevStack };
          const stackCopy = [
            ...prevStack[res.target.group][res.target.channel],
          ];

          const index = stackCopy.findIndex(
            (message) => message.clusterTimestamp === res.data.clusterTimestamp
          );

          console.log(res);
          const contentCopy =
            dataCopy[res.target.group][res.target.channel][index].content;

          contentCopy[0] = res.data.content[0];

          dataCopy[res.target.group][res.target.channel][index] = res.data;
          dataCopy[res.target.group][res.target.channel][index].content =
            contentCopy;

          return dataCopy;
        });
      }

      socket.emit("newCluster", genesisCluster, (res) => {
        clusterAcknowledged(res);
      });
    } else if (elapsed < 60000 && lastSender === localStorage.username) {
      // create an object with necessary info to send to api
      const appendObject = {
        target: {
          cluster: {
            timestamp: lastCluster.clusterTimestamp
              ? lastCluster.clusterTimestamp
              : null,
            id: lastCluster._id ? lastCluster._id : null,
          },
          group: selectedGroup._id,
          channel: selectedChannel._id,
        },
        content: { ...messageData },
      };

      // find the index of the message to be append locally,
      let clusterIndex;
      if (appendObject.target.cluster.id) {
        clusterIndex = chatData[selectedGroup._id][
          selectedChannel._id
        ].findIndex(
          (cluster) => cluster._id === appendObject.target.cluster.id
        );
      } else {
        clusterIndex = chatData[selectedGroup._id][
          selectedChannel._id
        ].findIndex(
          (cluster) =>
            cluster.clusterTimestamp === appendObject.target.cluster.timestamp
        );
      }

      // update local data with temporary data
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };

        const updatedCluster =
          dataCopy[selectedGroup._id][selectedChannel._id][clusterIndex];
        updatedCluster.content.push(messageData);

        dataCopy[selectedGroup._id][selectedChannel._id][clusterIndex] =
          updatedCluster;

        return dataCopy;
      });

      function appendAcknowledged(res) {
        console.log("append event");
        setChatData((prevStack) => {
          debugger;
          const dataCopy = { ...prevStack };
          const stackCopy = [
            ...prevStack[res.target.group][res.target.channel],
          ]; // ! is selected x a good way to do this? what if channel changes, use id? given by res

          // find parent
          let clusterKey;
          if (res.target.cluster.id) clusterKey = "id";
          else if (res.target.cluster.timestamp) {
            clusterKey = ["clusterTimestamp", "timestamp"];
          }

          const clusterIndex = stackCopy.findIndex(
            (cluster) => cluster[clusterKey] === res.target.cluster[clusterKey]
          );

          console.log(res);
          console.log(stackCopy[clusterIndex]);

          // find message
          let messageIndex = stackCopy[clusterIndex].content.findIndex(
            (message) =>
              message.timestamp === (res.err ? res.err : res.data.timestamp)
          ); // index always 0 because ternary and operator precedence, use parentheses to eval right side first

          // ! msgIndex is -1

          // todo failed

          // if (messageIndex === -1 && res.delayed) {
          //   const array = stackCopy[clusterIndex].content;
          //   // push and sort
          //   // recursive

          //   function sortAndInsert() {}

          //   function sort(params) {
          //     const { input, sortBy, reverse = false } = params;
          //     if (typeof input !== array) {
          //       throw new Error("input needs to be an array");
          //     }
          //     console.log("hello");
          //   }

          //   if (stackCopy) {
          //   }
          // }

          dataCopy[res.target.group][res.target.channel][clusterIndex].content[
            messageIndex
          ] = res.data;

          return dataCopy;
        });
      }

      // send append info to api
      socket.emit("appendCluster", appendObject, (res) =>
        appendAcknowledged(res)
      );
    }
  }

  // todo set up intervals to rerender, for updated timestamp display

  function renderMessages(stack) {
    const renderedStack = [];

    function renderContent(content) {
      const renderedContent = [];
      // todo support content other than text
      // todo support failed status
      content.forEach((content) => {
        renderedContent.push(
          <Message
            key={content.timestamp}
            timestamp={content.timestamp}
            pending={content._id ? false : true}
          >
            {content.text}
          </Message>
        );
      });
      return renderedContent;
    }

    stack.forEach((message) => {
      renderedStack.push(
        <Sender
          sender={message.sender}
          timestamp={message.clusterTimestamp}
          key={message.clusterTimestamp}
          pending={message._id ? false : true}
        >
          {renderContent(message.content)}
        </Sender>
      );
    });
    return renderedStack;
  }

  if (!groupMounted) {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={channel} />

        <div className="w-full flex-grow overflow-y-hidden">
          <ChatSkeletonLoader count={15} />

          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gray-600 h-screen w-3/4 lg:w-4/5 flex flex-col relative">
        <ChannelBanner name={selectedChannel.name} />

        <div className="w-full flex-grow overflow-y-scroll scrollbar-dark scroll-smooth">
          {renderMessages(chatStack)}
          <div className="w-full h-24" ref={endStopRef}></div>
          <ChatInputBox return={sendOut} />
        </div>
      </section>
    );
  }
}

export default ChatWindow;
