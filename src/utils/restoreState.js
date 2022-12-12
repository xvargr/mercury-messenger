import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { DataContext } from "../components/context/DataContext";
import { UiContext } from "../components/context/UiContext";

import useLocalFallback from "./localFallback";

export default function useStateRestore() {
  const { groupData, dataReady } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const { group: groupParam, channel: channelParam } = useParams();
  const navigate = useNavigate();

  const { retrieveStored } = useLocalFallback();

  useEffect(() => {
    if (dataReady) {
      const cachedGroupId = retrieveStored.groupId();
      const cachedChannelId = retrieveStored.channelId();

      const cachedGroupName = retrieveStored.groupName();
      const cachedChannelName = retrieveStored.channelName();

      // reroute to home is discrepancy exists between current location and backed up location
      // else, restore selected context
      if (groupParam && cachedGroupId) {
        if (groupParam !== cachedGroupName) navigate("/");
        const restoredGroup = groupData[cachedGroupId];
        if (!restoredGroup) navigate("/");
        setSelectedGroup(restoredGroup);
      }

      if (channelParam && cachedChannelId) {
        if (channelParam !== cachedChannelName) navigate("/");
        const restoredChannel = groupData[cachedGroupId].channels.text.find(
          (channel) => channel._id === cachedChannelId
        );
        if (!restoredChannel) navigate("/");
        setSelectedChannel(restoredChannel);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady]);
}
