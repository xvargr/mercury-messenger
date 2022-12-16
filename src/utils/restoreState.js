import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { DataContext } from "../components/context/DataContext";

import useLocalFallback from "./localFallback";

// this hook reads the cached group and channel id from local storage and uses it to "remember" the
// "browser's" position and retrieve the relevant data necessary to show the loaded page
// used primarily on refresh
export default function useStateRestore() {
  const {
    groupData,
    dataMounted,
    chatMounted,
    stateRestored,
    setStateRestored,
    setSelectedGroup,
    setSelectedChannel,
  } = useContext(DataContext);
  const { group: groupParam, channel: channelParam } = useParams();
  const navigate = useNavigate();

  const { retrieveStored } = useLocalFallback();

  useEffect(() => {
    if (dataMounted && chatMounted && !stateRestored) {
      console.log("restoringState");
      const cachedGroupId = retrieveStored.groupId();
      const cachedChannelId = retrieveStored.channelId();

      const cachedGroupName = retrieveStored.groupName();
      const cachedChannelName = retrieveStored.channelName();

      // reroute to home is discrepancy exists between current location and backed up location
      // else, restore selected context
      console.log(cachedChannelId);
      console.log(cachedGroupId);
      if (groupParam && cachedGroupId) {
        if (groupParam !== cachedGroupName) navigate("/");
        const restoredGroup = groupData[cachedGroupId];
        console.log(restoredGroup);
        if (!restoredGroup) navigate("/");
        setSelectedGroup(restoredGroup);
      }

      if (channelParam && cachedChannelId) {
        if (channelParam !== cachedChannelName) navigate("/");
        const restoredChannel = groupData[cachedGroupId].channels.text.find(
          (channel) => channel._id === cachedChannelId
        );
        console.log(restoredChannel);
        if (!restoredChannel) navigate("/");
        setSelectedChannel(restoredChannel);
      }

      setStateRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMounted, chatMounted]);
}
