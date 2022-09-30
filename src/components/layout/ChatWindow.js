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

  // if (selectedChannel)
  //   console.log(`CHAT RERENDERED FOR ${selectedChannel.name}`);
  // console.log(chatStack);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // update the local chat stack on main chat data update
    if (groupMounted) {
      // console.log(
      //   "chatData",
      //   chatData[selectedGroup._id][selectedChannel._id].length
      // );
      setChatStack(chatData[selectedGroup._id][selectedChannel._id]);
      console.log("chatdata in main");
      console.table(
        chatData[selectedGroup._id][selectedChannel._id][0]?.content
      ); // ! already 2 items
    }
  });

  // console.log(chatStack);
  // chatStack.forEach((message) => console.log("message: ", message.text));

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

    // console.log("elapsed: ", elapsed);
    // console.log("lastSender", lastSender);

    // new cluster if last message is more than 1 min ago or someone else messaged since
    if (elapsed > 60000 || lastSender !== localStorage.username) {
      const genesisCluster = {
        senderId: localStorage.userId,
        target: { group: selectedGroup._id, channel: selectedChannel._id },
        content: messageData,
      };

      // ? no id marks this as a pending mesasge
      const pendingCluster = {
        sender: {
          username: localStorage.username,
          userImage: {
            thumbnailMedium: localStorage.userImageMedium,
          },
        },
        channel: {},
        content: [genesisCluster.content],
        clusterTimestamp: messageData.timestamp,
      };

      // ! don't use elected context
      setChatData((prevStack) => {
        const dataCopy = { ...prevStack };
        dataCopy[selectedGroup._id][selectedChannel._id].push(pendingCluster);
        return dataCopy;
      });

      function clusterAcknowledged(res) {
        setChatData((prevStack) => {
          // setState callback is used to access the latest pending state before rerender
          // spread so that the values instead of the pointer is referenced by the new variable
          // else state will see no change since the pointer doesn't change even if the values did
          // make a copy of the whole chatData and the specific chat being modified
          const dataCopy = { ...prevStack };
          const stackCopy = [
            ...prevStack[selectedGroup._id][selectedChannel._id],
          ];
          const index = stackCopy.findIndex(
            (message) => message.clusterTimestamp === res.clusterTimestamp
          );
          // replace the pending message object with the finalized one
          stackCopy[index] = res;
          dataCopy[selectedGroup._id][selectedChannel._id] = stackCopy; // todo all in one go

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
      // use id if verified, else use timestamp
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
        console.log("appending..");
        console.log("chatData before append"); // ! already 2 items
        console.table(
          chatData[selectedGroup._id][selectedChannel._id][0]?.content
        ); // ! already 2 items

        // ! the fist item is already overwritten by the pending item, but has id?
        setChatData((prevStack) => {
          const dataCopy = { ...prevStack };
          const stackCopy = [
            ...prevStack[res.target.group][res.target.channel],
          ]; // ! is selected x a good way to do this? what if channel changes, use id? given by res

          // dynamic search index term assignment based on what's available in the response

          // if failed, no parent file, but target available
          // if pass, parent file present, target available

          // need to find parent cluster
          // then find message to update status to saved or failed

          // let term;
          // if (res.failed) {
          //   if (res.target.cluster.id)
          //     term = "id"; // message failed and parent is verified
          //   else if (res.target.cluster.timestamp) term = "timestamp"; // message failed and the parent unverified
          // } else if (res.content) {
          //   if (res.content._id)
          //     term = "_id"; // message saved and the parent verified
          //   else if (res.content.clusterTimestamp) term = "clusterTimestamp"; // message saved and the parent unverified
          // }

          // console.log("res: ", res);

          // debugger;

          // find parent
          let clusterKey;
          if (res.target.cluster.id) clusterKey = "id";
          else if (res.target.cluster.timestamp)
            clusterKey = ["clusterTimestamp", "timestamp"];

          // console.log("stackCopy - ", stackCopy);

          const clusterIndex = stackCopy.findIndex(
            (cluster) => cluster[clusterKey] === res.target.cluster[clusterKey]
          );

          // console.log(
          //   "timestamp of n1",
          //   stackCopy[clusterIndex].content[1].timestamp
          // );

          // const hey = false ? 1 : 2;
          // console.log("HEY ", hey);

          // console.log("res.err ternary: ", res.err ? true : false);

          // ? ////////////////////////////////////////////////////////////

          // const array = [
          //   { string: "zero" },
          //   { string: "one" },
          //   { string: "two" },
          // ];

          // let condition = true;
          // const isTrue = condition ? true : false;
          // console.log("isTrue: ", isTrue);

          // let index = array.findIndex((element) =>
          //   element.string === condition ? "one" : "two"
          // );
          // console.log("index when condition is true", index);

          // condition = false;
          // const conditionIsFalse = condition ? false : true;
          // console.log("conditionIsFalse: ", conditionIsFalse);

          // index = array.findIndex((element) =>
          //   element.string === condition ? "one" : "two"
          // );
          // console.log("index when condition is false", index);

          // ? ////////////////////////////////////////////////////////////

          // find message
          let messageIndex = stackCopy[clusterIndex].content.findIndex(
            (message) =>
              message.timestamp === (res.err ? res.err : res.content.timestamp)
          ); // index always 0 because ternary and operator precedence, use parentheses

          // console.log("content to update: ", stackCopy[clusterIndex].content); // ! already 2 items
          // console.log("res.content.timestamp: ", res.content.timestamp);
          // // console.log("res.err: ", res.err);

          // console.log("cluster - ", clusterIndex);
          // console.log("message - ", messageIndex);

          // if (res.failed) {
          //   // find parent,
          //   // find msg with timestamp
          //   // set status as failed
          // } else {
          //   // find parent
          //   // find msg with timestamp
          // }
          // console.log("term: ", term);

          // find parent cluster
          // const clusterIndex = stackCopy.findIndex((cluster) =>
          //   cluster[term] === res.failed
          //     ? res.target.cluster[term]
          //     : res.content[term]
          // );

          // console.assert(index === -1, "message not found");

          // console.log("Cl-index: ", clusterIndex);
          // console.log("Msg-index: ", index);
          // console.log(res);

          // // update local parent cluster to res data
          // dataCopy[res.target.group][res.target.channel][index].content =
          //   res.content;

          // todo failed

          console.log(
            `replacing cluster ${clusterIndex} message ${messageIndex} with ${res.content.text}`
          );

          dataCopy[res.target.group][res.target.channel][clusterIndex].content[
            messageIndex
          ] = res.content;

          // console.log(dataCopy);

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

  // console.log(socket);

  function renderMessages(stack) {
    // console.log("stack to render: ", stack);
    const renderedStack = [];

    function renderContent(content) {
      const renderedContent = [];
      // todo support content other than text
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
