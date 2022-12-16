import { useContext } from "react";

import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";

import Sender from "../components/chat/SenderWrapper";
import Message from "../components/chat/Message";
import GroupBadge from "../components/groups/GroupBadge";
import ChannelBadge from "../components/channels/ChannelBadge";
import MemberStatusBadge from "../components/channels/MemberStatusBadge";
import {
  FlashMessageWrapper,
  FlashMessage,
} from "../components/ui/FlashMessage";

// utility hooks
import useSocket from "./socket";

export function FlashStack() {
  const { messageStack, unmountFlash } = useContext(FlashContext);
  const stack = [];

  messageStack?.forEach((message) => {
    // messageStack?.map((message) => {
    const position = messageStack.indexOf(message);

    stack.push(
      <FlashMessage
        type={message.type}
        message={message.message}
        key={position}
        position={position}
        unmount={unmountFlash}
      />
    );
  });

  return <FlashMessageWrapper>{stack}</FlashMessageWrapper>;
}

export function GroupStack() {
  const { groupData, selectedGroup, setSelectedGroup, setSelectedChannel } =
    useContext(DataContext);

  function groupChangeHandler(groupId) {
    setSelectedGroup(groupData[groupId]);
    setSelectedChannel(null);
  }

  const groupStack = [];

  for (const groupId in groupData) {
    const thisGroup = groupData[groupId];
    const selected = groupId === selectedGroup?._id;

    groupStack.push(
      <GroupBadge
        name={thisGroup.name}
        img={thisGroup.image.thumbnail}
        selected={selected}
        key={thisGroup._id}
        onClick={() => groupChangeHandler(thisGroup._id)}
      />
    );
  }
  return groupStack;
}

export function ChannelStack() {
  const { groupData, setSelectedChannel, selectedGroup, selectedChannel } =
    useContext(DataContext);

  const thisGroup = groupData[selectedGroup._id];

  const isAdmin = thisGroup.administrators.some(
    (admin) => admin._id === localStorage.userId
  );

  const channelStack = [];

  thisGroup.channels.text.forEach((channel) => {
    const selected = selectedChannel?._id === channel._id ? true : false;

    channelStack.push(
      <ChannelBadge
        data={channel}
        selected={selected}
        type="text"
        key={channel._id}
        onClick={() => setSelectedChannel(channel)}
        isAdmin={isAdmin}
      />
    );
  });

  return channelStack;
}

export function MemberStack() {
  const { groupData, selectedGroup } = useContext(DataContext);
  const { peerHelpers } = useContext(DataContext);

  const thisGroup = groupData[selectedGroup._id];

  const memberStack = [];

  thisGroup.members.forEach((member) => {
    memberStack.push(
      <MemberStatusBadge
        member={member}
        status={peerHelpers.getStatus(member._id)}
        key={member._id}
      />
    );
  });
  return memberStack;
}

// renders every cluster in the current chat
export function ChatStack() {
  const { groupData, selectedGroup, selectedChannel } = useContext(DataContext);

  const { sendMessage, appendMessage } = useSocket();

  const thisGroup = groupData[selectedGroup._id];

  const chatData = thisGroup.chatData[selectedChannel._id];

  const clusterStack = [];
  const isUserAdmin = {};

  thisGroup.members.forEach((member) => {
    const isAdmin = thisGroup.administrators.some(
      (admin) => admin._id === member._id
    );
    isUserAdmin[member._id] = isAdmin ? true : false;
  });

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
          removeLocally: null,
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
            data={message.text}
            pending={message._id ? false : true}
            failed={message.failed} // indicates fails on messages
            retryObject={isGenesis ? retryObject : null} // enables retry actions on genesis message if any child failed
          />
        );
      }
      if (isGenesis) isGenesis = false;
    });
    return messageStack;
  }

  chatData.forEach((cluster) => {
    clusterStack.push(
      <Sender
        sender={cluster.sender}
        timestamp={cluster.clusterTimestamp}
        key={cluster.clusterTimestamp}
        pending={cluster._id ? false : true}
        isAdmin={isUserAdmin[cluster.sender._id]}
      >
        {renderMessages(cluster)}
      </Sender>
    );
  });
  return clusterStack;
}
