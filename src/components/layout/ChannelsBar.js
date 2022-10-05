import { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
// components
import ChannelBadge from "../channels/ChannelBadge";
import NewChannelButton from "../channels/NewChannelButton";
import GroupBanner from "../channels/GroupBanner";
// context
import { UiContext } from "../context/UiContext";
import { DataContext } from "../context/DataContext";
import { SkeletonChannel } from "../ui/SkeletonLoaders";

function ChannelsBar() {
  const { group } = useParams();
  const { groupData, groupMounted } = useContext(DataContext);
  const { selectedChannel, selectedGroup, setSelectedChannel } =
    useContext(UiContext);
  const navigate = useNavigate();

  // redirect 404 if group not found
  if (groupMounted && !groupData.find((grp) => grp.name === group)) {
    navigate("/404");
  }

  let isAdmin;
  if (groupMounted && selectedGroup) {
    isAdmin = selectedGroup.administrators.some(
      (admin) => admin._id === localStorage.userId
    );
  }

  const groupIndex = groupMounted
    ? groupData.findIndex((data) => {
        return data.name === selectedGroup.name;
      })
    : null;

  function channelChangeHandler(channel) {
    setSelectedChannel(channel);
  }

  if (!groupMounted) {
    return (
      <section className="bg-gray-700 h-screen w-1/4 lg:w-1/5 shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
        <GroupBanner name={group} />
        <div className="w-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center">
          <div className="w-1/3 mb-2 mt-2"></div>
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gray-700 h-screen w-1/4 lg:w-1/5 shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
        <GroupBanner name={selectedGroup.name} />
        <div className="w-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center">
          <div className="w-1/3 mb-2 mt-2"></div>
          {groupData[groupIndex].channels.text.map((channel) => {
            let selected =
              selectedChannel?.name === channel.name ? true : false;

            return (
              <ChannelBadge
                data={channel}
                groupIndex={groupIndex}
                selected={selected}
                key={channel._id}
                onClick={channelChangeHandler}
                isAdmin={isAdmin}
              />
            );
          })}
          {isAdmin ? <NewChannelButton for={selectedGroup} /> : null}
          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />
          {/* {groupData[groupIndex].channels.text.map((channel) => {
            let selected = selectedChannel === channel.name ? true : false;
            // todo tasks here
            return (
              <ChannelBadge
                name={channel.name}
                selected={selected}
                key={channel.name}
                onClick={channelChangeHandler}
              />
            );
          })} */}
        </div>
      </section>
    );
  }
}

export default ChannelsBar;
