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
import SelectableMemberBadge from "../components/ui/SelectableMemberBadge";

export function FlashStack() {
  const { messageStack, unmountFlash } = useContext(FlashContext);
  const stack = [];

  messageStack?.forEach((message) => {
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
  const {
    groupData,
    selectedGroup,
    setSelectedGroup,
    setSelectedChannel,
    dataHelpers,
  } = useContext(DataContext);

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
        unread={dataHelpers.getUnread({ groupId })}
        key={thisGroup._id}
        onClick={() => groupChangeHandler(thisGroup._id)}
      />
    );
  }
  return groupStack;
}

export function ChannelStack() {
  const {
    groupData,
    setSelectedChannel,
    selectedGroup,
    selectedChannel,
    dataHelpers,
  } = useContext(DataContext);

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
        unread={dataHelpers.getUnread({ channelId: channel._id })}
        key={channel._id}
        onClick={() => setSelectedChannel(channel)}
        isAdmin={isAdmin}
      />
    );
  });

  return channelStack;
}

export function MemberStatusStack() {
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
        isAdmin={true}
      />
    );
  });
  return memberStack;
}

export function MentionsSelector(props) {
  const { selectedMembers, onSelect, onDeselect } = props;
  const { groupData, selectedGroup } = useContext(DataContext);

  const thisGroup = groupData[selectedGroup._id];
  const memberStack = [];

  function toggleSelection(userId) {
    if (!selectedMembers.includes(userId)) onSelect(userId);
    else onDeselect(userId);
  }

  thisGroup.members.forEach((member) => {
    if (member._id === localStorage.userId) return null; // don't render this user

    const selected = selectedMembers.includes(member._id);

    memberStack.push(
      <SelectableMemberBadge
        member={member}
        key={member._id}
        selected={selected}
        onClick={toggleSelection}
      />
    );
  });

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto scrollbar-dark">
      {memberStack}
    </div>
  );
}

// renders every cluster in the current chat
export function ChatStack() {
  const { groupData, selectedGroup, selectedChannel, dataHelpers } =
    useContext(DataContext);
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
    const content = cluster.content;
    const messageStack = [];
    const someFailed = content.some((message) => message?.failed);
    const allConfirmed = content.every(
      (message) => message?.failed || message._id
    ); // prevent retry actions if some messages are still pending
    let isGenesis = true;
    let retryObject = null;

    // creates object with all necessary information for a retry if any failed
    if (someFailed && allConfirmed) {
      retryObject = {
        clusterData: cluster,
        actions: {
          sendMessage,
          appendMessage,
          removeClusterLocally: dataHelpers.removeClusterLocally,
        },
        chatLocation: {
          group: selectedGroup._id,
          channel: selectedChannel._id,
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
            text={message.text}
            image={message.file}
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
    const userMentioned = cluster.mentions.some(
      (user) => user._id === localStorage.userId
    );

    clusterStack.push(
      <Sender
        sender={cluster.sender}
        timestamp={cluster.clusterTimestamp}
        key={cluster.clusterTimestamp}
        pending={cluster._id ? false : true}
        isAdmin={isUserAdmin[cluster.sender._id]}
        userMentioned={userMentioned}
        mentions={cluster.mentions}
      >
        {renderMessages(cluster)}
      </Sender>
    );
  });
  return clusterStack;
}
