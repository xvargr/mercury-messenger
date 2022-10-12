import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosRetry from "axios-retry";

import { DataContext } from "../components/context/DataContext";

export default function useAxiosInstance() {
  const { groupData, setGroupData, setGroupMounted } = useContext(DataContext);
  const navigate = useNavigate();
  const config = {
    headers: { "Content-Type": "multipart/form-data" },
  };

  // const fetchController = new AbortController(); // axios abort controller
  const controller = new AbortController();

  function fetchGroups() {
    const fetchGroupsInstance = axios.create({
      baseURL: `${window.location.protocol}//${window.location.hostname}:3100`,
      withCredentials: true,
    });

    axiosRetry(fetchGroupsInstance, {
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
        // todo more retry conditions
        // return true; // retry every time
      },
    });

    // return fetchGroupsInstance.get("/g", { signal: fetchController.signal });
    return fetchGroupsInstance.get("/g", {
      signal: controller.signal,
    });
  }

  function abortFetch() {
    console.log("aborting fetch");
    controller.abort();
  }
  // function abortFetch() {
  //   console.log("aborting fetch");
  //   fetchController.abort();
  //   console.log(fetchController);
  // }

  // useEffect(() => {
  //   return () => {
  //     console.log("cleanup in hook?");
  //   };
  // }, []);

  return {
    fetchGroups,
    abortFetch,
    controller,
  };
}

// function axDeleteChannel(params) {
//   const {channelId} = params

//   const axiosDeleteChannel = axios.create({
//     baseURL: `${window.location.protocol}//${window.location.hostname}:3100`,
//     withCredentials: true,
//   });

//   axiosDeleteChannel
//     .delete(`/c/${channelId}`)
//     .then((res) => {
//       const tempGroupData = groupData;
//       const updatedGroupData = res.data.groupData;

//       tempGroupData[props.groupIndex] = updatedGroupData;
//       setGroupData(tempGroupData);
//       setFlashMessages(res.data.messages);

//       navigate(`/g/${selectedGroup.name}`);
//     })
//     .catch((err) => {
//       setFlashMessages(err.response.data.messages);
//     });
// }
