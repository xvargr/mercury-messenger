import { useContext, useEffect, useMemo } from "react";
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
  const {
    selectedChannel,
    selectedGroup,
    setSelectedChannel,
    setSelectedGroup,
  } = useContext(UiContext);
  const navigate = useNavigate();

  const groupFound = useMemo(
    () => groupData?.find((grp) => grp.name === group) ?? false,
    // () => groupData?.find((grp) => grp.id === selectedGroup?.id) ?? false,
    [group, groupData]
  );

  // redirect and refresh position preservation
  useEffect(() => {
    if (groupMounted) {
      if (!groupFound) navigate("/404");
      else if (groupFound) setSelectedGroup(groupFound);
      else if (!selectedGroup) navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMounted, groupFound]);

  let isAdmin;
  if (groupMounted && selectedGroup) {
    isAdmin = selectedGroup.administrators.some(
      (admin) => admin._id === localStorage.userId
    );
  }

  const groupIndex =
    groupMounted && selectedGroup
      ? groupData.findIndex((group) => {
          return group.id === selectedGroup.id;
        })
      : null;

  function channelChangeHandler(channel) {
    if (!channel) setSelectedChannel(null);
    else setSelectedChannel(channel);
  }

  if (!groupMounted || !selectedGroup) {
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
          {isAdmin ? (
            <NewChannelButton
              for={selectedGroup}
              onClick={channelChangeHandler}
            />
          ) : null}
          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />
        </div>
      </section>
    );
  }
}

export default ChannelsBar;
