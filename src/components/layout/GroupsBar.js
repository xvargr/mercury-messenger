import { useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import axiosRetry from "axios-retry";
// components
import GroupBadge from "../groups/GroupBadge";
import NewGroupButton from "../groups/NewGroupButton";
import Logo from "../groups/Logo";
import UserBadge from "../groups/UserBadge";
import { SkeletonGroup } from "../ui/SkeletonLoaders";
// context
import { UiContext } from "../context/UiContext";
import { DataContext } from "../context/DataContext";

// todo set group as group object

function GroupsBar() {
  const { group, channel } = useParams();
  const { groupData, groupMounted, setGroupData, setGroupMounted, isLoggedIn } =
    useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel, selectedChannel } =
    useContext(UiContext);
  const navigate = useNavigate();

  const controller = new AbortController(); // axios abort controller

  function fetchGroups() {
    const axiosGroupFetch = axios.create({
      baseURL: "http://localhost:3100",
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
    // .catch((err) => {
    //   // nothing really
    // });
  }

  if (!groupMounted && localStorage.username && isLoggedIn) fetchGroups();

  useEffect(() => {
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // abort axios request on unmount

  function groupChangeHandler(group) {
    // console.log("CLICKED");
    setSelectedGroup(groupData.find((grp) => grp.name === group));
    setSelectedChannel(null);
    // console.log("params: ", group, channel);
    // console.log("context: ", selectedGroup, selectedChannel);
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
