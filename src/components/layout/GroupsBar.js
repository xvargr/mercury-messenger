import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
// components
import GroupBadge from "../groups/GroupBadge";
import NewGroupButton from "../groups/NewGroupButton";
import Logo from "../groups/Logo";
import UserBadge from "../groups/UserBadge";
import { SkeletonGroup } from "../ui/SkeletonLoaders";
// context
import { UiContext } from "../context/UiContext";
import { DataContext } from "../context/DataContext";
import { SocketContext } from "../context/SocketContext";
// utility hooks
import axiosInstance from "../../utils/axios";

function GroupsBar() {
  const { group, channel } = useParams();
  const { groupData, groupMounted, setGroupData, setGroupMounted, isLoggedIn } =
    useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const { socketIsConnected, connectSocket } = useContext(SocketContext);
  const { userGroups } = axiosInstance();

  useEffect(() => {
    if (groupMounted && isLoggedIn && socketIsConnected === false)
      connectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMounted]);

  useEffect(() => {
    if (!groupMounted && isLoggedIn) {
      userGroups
        .fetch()
        .then((res) => {
          const groupData = res.data;

          if (group) {
            const currentGroup = groupData.find((grp) => grp.name === group);
            setSelectedGroup(currentGroup);
            if (channel) {
              const currentChannel = currentGroup.channels.text.find(
                (chn) => chn.name === channel
              );
              setSelectedChannel(currentChannel);
            } else setSelectedChannel(null);
          } else setSelectedGroup(null);

          setGroupMounted(true);
          setGroupData(groupData);
        })
        .catch((e) => e);
    }
    return () => {
      userGroups.abortFetch(); // abort fetch on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }); // abort axios request on unmount

  function groupChangeHandler(group) {
    setSelectedGroup(groupData.find((grp) => grp.name === group));
    setSelectedChannel(null);
  }

  if (!groupMounted) {
    return (
      <nav className="bg-gray-800 w-20 flex flex-col overflow-hidden shrink-0">
        <Logo className="bg-gray-800" />

        <UserBadge />

        <hr className="m-2 mb-0 mt-0 border-gray-600" />

        <div className="w-full overflow-y-scroll overflow-x-hidden scrollbar-none">
          <SkeletonGroup />
          <SkeletonGroup />
          <SkeletonGroup />

          <NewGroupButton />
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="bg-gray-800 w-20 flex flex-col overflow-hidden shrink-0">
        <Logo />

        <UserBadge />

        <hr className="m-2 mb-0 mt-0 border-gray-600" />

        <div className="w-full overflow-y-scroll overflow-x-hidden scrollbar-none">
          {groupData?.map((grp) => {
            const selected = group === grp.name ? true : false;

            return (
              <GroupBadge
                name={grp.name}
                img={grp.image.thumbnail}
                selected={selected}
                key={grp._id}
                onClick={groupChangeHandler}
              />
            );
          })}

          <NewGroupButton />
        </div>
      </nav>
    );
  }
}

export default GroupsBar;
