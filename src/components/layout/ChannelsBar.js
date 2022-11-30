import { useContext, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components
import ChannelBadge from "../channels/ChannelBadge";
import NewChannelButton from "../channels/NewChannelButton";
import GroupBanner from "../channels/GroupBanner";
import MemberStatusBadge from "../channels/MemberStatusBadge";

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

  console.count("channels bar rerendered");

  // redirect and refresh position preservation
  useEffect(() => {
    if (groupMounted) {
      // console.log("groupFound", groupFound);
      if (!groupFound) navigate("/404");
      else if (groupFound) setSelectedGroup(groupFound);
      else if (!selectedGroup) navigate("/");
      // console.log("selectedGroup", selectedGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMounted, groupFound]);
  // console.log("selectedGroup Out", selectedGroup);

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
      <section className="bg-gray-700 h-screen w-1/4 lg:w-1/5 max-w-sm lg:min-w-[24rem] shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
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
      <section className="bg-gray-700 h-screen w-1/4 lg:w-1/5 max-w-sm min-w-[10rem] md:min-w-[15rem] shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
        <GroupBanner name={selectedGroup.name} />
        <div className="w-full h-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center justify-between">
          <div className="w-full max-h-[50%] grow flex flex-col items-center overflow-y-scroll scrollbar-dark">
            <div className="mt-4"></div>

            {groupData[groupIndex].channels.text.map((channel) => {
              let selected =
                selectedChannel?.name === channel.name ? true : false;

              return (
                <ChannelBadge
                  data={channel}
                  groupIndex={groupIndex}
                  selected={selected}
                  type="text"
                  key={channel._id}
                  onClick={channelChangeHandler}
                  isAdmin={isAdmin}
                />
              );
            })}
            <div className="w-full pt-1 bg-gray-700 flex flex-col items-center sticky-reverse">
              {isAdmin ? (
                <NewChannelButton
                  for={selectedGroup}
                  onClick={channelChangeHandler}
                />
              ) : null}
            </div>
          </div>

          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />

          <div className="w-full h-1/2 py-1 flex flex-col items-center overflow-y-scroll scrollbar-dark">
            {groupData[groupIndex].members.map((member) => {
              const status = "away"; // ! evaluate this, pending backend

              return (
                <MemberStatusBadge
                  member={member}
                  status={status}
                  key={member._id}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}

export default ChannelsBar;
