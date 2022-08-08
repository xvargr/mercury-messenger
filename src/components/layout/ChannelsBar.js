import { useEffect, useContext, useState, useRef } from "react";
import { useParams } from "react-router-dom";
// import axios from "axios";
// components
import Channels from "../channels/ChannelBadge";
import NewChannelButton from "../channels/NewChannelButton";
import GroupBanner from "../channels/GroupBanner";
// context
import { UiContext } from "../context/UiContext";
import { DataContext } from "../context/DataContext";
import SkeletonChannel from "../ui/SkeletonChannel";

function ChannelsBar() {
  const { group, channel } = useParams();
  const { groupData, setGroupData, groupMounted } = useContext(DataContext);
  const {
    selectedChannel,
    selectedGroup,
    setSelectedChannel,
    setSelectedGroup,
  } = useContext(UiContext);

  console.count("CHANNEL RERENDED");

  const groupIndex = groupMounted
    ? groupData.findIndex((data) => {
        return data.name === selectedGroup;
      })
    : null;

  if (!groupMounted) {
    return (
      <section className="bg-gray-700 h-screen w-1/4 shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
        <GroupBanner name={group} />
        <div className="w-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center">
          <div className="w-1/3 mb-2 mt-2"></div>
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gray-700 h-screen w-1/4 shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
        <GroupBanner name={group} />
        <div className="w-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center">
          <div className="w-1/3 mb-2 mt-2"></div>
          {console.log(groupData[groupIndex].channels)}
          {groupData[groupIndex].channels.map((channel) => {
            let selected = selectedChannel === channel.name ? true : false;

            return (
              <Channels
                name={channel.name}
                selected={selected}
                key={channel.name}
              />
            );
          })}
          <NewChannelButton />
          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />
        </div>
      </section>
    );
  }
}

export default ChannelsBar;
