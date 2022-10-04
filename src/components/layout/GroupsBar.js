import { useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import axiosRetry from "axios-retry";
import { io } from "socket.io-client";
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

function GroupsBar() {
  const { group, channel } = useParams();
  const {
    groupData,
    groupMounted,
    setGroupData,
    setGroupMounted,
    isLoggedIn,
    setChatData, // todo set chat data on fetch
  } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const { socket, setSocket } = useContext(SocketContext);
  const navigate = useNavigate();

  const controller = new AbortController(); // axios abort controller

  function fetchGroups() {
    const axiosGroupFetch = axios.create({
      baseURL: `${window.location.protocol}//${window.location.hostname}:3100`,
      withCredentials: true,
    });

    axiosRetry(axiosGroupFetch, {
      retries: 5, // number of retries
      retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 10000; // time interval between retries
      },
      retryCondition: (error) => {
        // if retry condition is not specified, by default idempotent requests are retried
        // return error.response.status === 503; // retry only if err 503
        if (error.response.status === 401) navigate("/login");
        else return true;
        // todo retry conditions
        // todo don't retry 401 unauthorized, reroute to login
        // return true; // retry every time
      },
    });

    axiosGroupFetch.get("/g", { signal: controller.signal }).then((res) => {
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
    });
  }

  if (!groupMounted && localStorage.username && isLoggedIn) fetchGroups();

  useEffect(() => {
    if (groupMounted && isLoggedIn && socket === null) {
      setSocket(
        io(`${window.location.protocol}//${window.location.hostname}:3100`, {
          withCredentials: true,
        })
      );
    }
  });

  useEffect(() => {
    return () => {
      controller.abort(); // abort fetch on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // abort axios request on unmount

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
