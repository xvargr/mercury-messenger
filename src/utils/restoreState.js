import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { DataContext } from "../components/context/DataContext";
import { UiContext } from "../components/context/UiContext";

import useLocalFallback from "./localFallback";

export default function useStateRestore() {
  const {
    groupData,
    dataMounted,
    chatMounted,
    stateRestored,
    setStateRestored,
  } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const { group: groupParam, channel: channelParam } = useParams();
  const navigate = useNavigate();

  const { retrieveStored } = useLocalFallback();

  useEffect(() => {
    // console.log("dataMounted", dataMounted);
    // console.log("chatMounted", chatMounted);
    // console.log("stateRestored", stateRestored);
    if (dataMounted && chatMounted && !stateRestored) {
      // console.log("restoringState");
      const cachedGroupId = retrieveStored.groupId();
      const cachedChannelId = retrieveStored.channelId();

      const cachedGroupName = retrieveStored.groupName();
      const cachedChannelName = retrieveStored.channelName();

      // reroute to home is discrepancy exists between current location and backed up location
      // else, restore selected context
      if (groupParam && cachedGroupId) {
        if (groupParam !== cachedGroupName) navigate("/");
        const restoredGroup = groupData[cachedGroupId];
        // console.log(restoredGroup);
        if (!restoredGroup) navigate("/");
        setSelectedGroup(restoredGroup);
      }

      if (channelParam && cachedChannelId) {
        if (channelParam !== cachedChannelName) navigate("/");
        const restoredChannel = groupData[cachedGroupId].channels.text.find(
          (channel) => channel._id === cachedChannelId
        );
        // console.log(restoredChannel);
        if (!restoredChannel) navigate("/");
        setSelectedChannel(restoredChannel);
      }

      // console.log(setStateRestored);
      setStateRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMounted, chatMounted]);
}
