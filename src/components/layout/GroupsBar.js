import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import axiosRetry from "axios-retry";
// components
import GroupBadge from "../groups/GroupBadge";
import NewGroupButton from "../groups/NewGroupButton";
import Logo from "../groups/Logo";
import UserBadge from "../groups/UserBadge";
import SkeletonGroup from "../ui/SkeletonGroup";
// context
import { UiContext } from "../context/UiContext";
import { DataContext } from "../context/DataContext";

//! this component rerenders every time a redirect happens

function GroupsBar() {
  const { group, channel } = useParams();
  const { groupData, groupMounted, setGroupData, setGroupMounted } =
    useContext(DataContext);
  const {
    selectedGroup,
    // selectedChannel,
    setSelectedGroup,
    setSelectedChannel,
  } = useContext(UiContext);
  const controller = new AbortController(); // axios abort controller
  // const dataMountedRef = useRef(false);
  // console.log("selectedGrselectedGroup in bar ", selectedGroup);

  // console.count("GROUP RERENDER");
  // console.log("DATA MOUNTED? ", groupMounted);

  function fetchGroups() {
    // console.log("refetch");

    const axiosGroupFetch = axios.create({ baseURL: "http://localhost:3100" });

    axiosRetry(axiosGroupFetch, {
      retries: 3, // number of retries
      retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 2000; // time interval between retries
      },
      retryCondition: (error) => {
        // if retry condition is not specified, by default idempotent requests are retried
        // return error.response.status === 503; // retry only if err 503
        return true; // retry every time
      },
    });

    axiosGroupFetch
      .get("/g", { signal: controller.signal })
      .then((res) => {
        // console.log("success:", res);
        // setIsLoading(false);
        // dataMountedRef.current = true;
        setSelectedGroup(group);
        setSelectedChannel(channel);
        setGroupMounted(true);
        setGroupData(res.data);
      })
      .catch((err) => console.log("error:", err));
  }

  if (!groupMounted) {
    // console.log("unmounted fire");
    fetchGroups();
  }

  useEffect(() => {
    return () => {
      console.log("aborted");
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ? abort axios request on unmount

  // useEffect(() => {
  //   fetchGroups();
  // }, [groupMounted]);

  // if (!groupMounted) {
  //   // console.count("AXIOS FETCHING");

  //   axiosRetry(axios, {
  //     retries: 3, // number of retries
  //     retryDelay: (retryCount) => {
  //       // console.log(`retry attempt: ${retryCount}`);
  //       return retryCount * 2000; // time interval between retries
  //     },
  //     retryCondition: (error) => {
  //       // if retry condition is not specified, by default idempotent requests are retried
  //       // return error.response.status === 503; // retry only if err 503
  //       return true; // retry every time
  //     },
  //   });

  //   axios
  //     .get("http://localhost:3100/g")
  //     .then((res) => {
  //       // console.log("success:", res);
  //       // setIsLoading(false);
  //       // dataMountedRef.current = true;
  //       setSelectedGroup(group);
  //       setSelectedChannel(channel);
  //       setGroupMounted(true);
  //       setGroupData(res.data);
  //     })
  //     .catch((err) => console.log("error:", err));
  // }

  function groupChangeHandler(group) {
    // console.log("CLICKED");
    setSelectedGroup(group);
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
            let selected = selectedGroup === grp.name ? true : false;

            return (
              <GroupBadge
                name={grp.name}
                img={grp.image.thumbnail}
                selected={selected}
                key={grp.name}
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
