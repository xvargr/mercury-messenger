import { useContext } from "react";
import { useParams } from "react-router-dom";

import { DataContext } from "../components/context/DataContext";
import { UiContext } from "../components/context/UiContext";

import Sender from "../components/chat/SenderWrapper";
import Message from "../components/chat/Message";
import GroupBadge from "../components/groups/GroupBadge";
import ChannelBadge from "../components/channels/ChannelBadge";
import MemberStatusBadge from "../components/channels/MemberStatusBadge";

// utility hooks
// import useLocalFallback from "./localFallback";
import useSocket from "./socket";

export function GroupStack() {
  const { groupData } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);

  const { group: groupParam } = useParams();

  //   const { updateStored } = useLocalFallback();

  function groupChangeHandler(groupId) {
    // console.log(groupData[groupId]);
    setSelectedGroup(groupData[groupId]);
    setSelectedChannel(null);
    // console.log(localFallback);
    // localFallback.update.lastGroup();
    // updateStored.all();
  }

  const groupStack = [];

  for (const group in groupData) {
    const thisGroup = groupData[group];
    const selected = groupParam === thisGroup.name;

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
  const { groupData } = useContext(DataContext);
  const {
    // setSelectedGroup,
    setSelectedChannel,
    selectedGroup,
    selectedChannel,
  } = useContext(UiContext);

  const thisGroup = groupData[selectedGroup._id];
  // const { channel: channelParam } = useParams();

  //   function channelChangeHandler(channel) {
  //     if (!channel) setSelectedChannel(null);
  //     else setSelectedChannel(channel);
  //   }

  const channelStack = [];

  //   console.log(selectedGroup);

  //   for (const channel of selectedGroup.channels.text) {
  const isAdmin = thisGroup.administrators.some(
    (admin) => admin._id === localStorage.userId
  );

  thisGroup.channels.text.forEach((channel) => {
    const selected = selectedChannel?.name === channel.name ? true : false;

    // console.log(channel);
    // console.log(channel.administrators);

    channelStack.push(
      <ChannelBadge
        data={channel}
        // groupIndex={groupIndex}
        selected={selected}
        type="text"
        key={channel._id}
        onClick={() => setSelectedChannel(channel)}
        isAdmin={isAdmin}
      />
    );
  });
  //   }

  //   groupData[groupIndex].channels.text.map((channel) => {

  //     return (
  //       <ChannelBadge
  //         data={channel}
  //         groupIndex={groupIndex}
  //         selected={selected}
  //         type="text"
  //         key={channel._id}
  //         onClick={channelChangeHandler}
  //         isAdmin={isAdmin}
  //       />
  //     );
  //   });

  return channelStack;
}

export function MemberStack() {
  const { groupData } = useContext(DataContext);
  const { selectedGroup } = useContext(UiContext);
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
export function ChatStack(params) {
  const { groupData } = useContext(DataContext);

  //   const { target, actions } = params;
  //   const { groupId, channelId } = target;
  //   const { sendMessage, appendMessage } = actions;
  //   const { Sender, Message } = components;

  const {
    //   setSelectedGroup,
    //   setSelectedChannel,
    selectedGroup,
    selectedChannel,
  } = useContext(UiContext);

  const { sendMessage, appendMessage } = useSocket();

  const thisGroup = groupData[selectedGroup._id];

  //   const { groupData } = useContext(DataContext);

  //   const group = selectedGroup;
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
    // console.log(cluster);
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
