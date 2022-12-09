import { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import { DataContext } from "../components/context/DataContext";
import { UiContext } from "../components/context/UiContext";

import useLocalFallback from "./localFallback";

export default function useStateRestore() {
  const { groupData, dataReady } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);

  const { group: groupParam, channel: channelParam } = useParams();
  const { retrieveStored } = useLocalFallback();

  useEffect(() => {
    // !! what if different grp/chn from stored? HANDLE THIS
    console.log("DATAREADY: ", dataReady);
    // console.log(channel);
    // console.log(group);
    // console.log(groupParam);
    // console.log(channelParam);

    if (dataReady) {
      const cachedGroupId = retrieveStored.groupId();
      const cachedChannelId = retrieveStored.channelId();
      //   console.log("groupData", groupData);
      //   console.log(localStorage);

      if (groupParam && cachedGroupId) {
        // console.log("restoring group");
        // console.log(cachedGroupId);
        // console.log(groupData[cachedGroupId]);
        // retrieveStored.groupId()
        // console.log(setSelectedGroup(groupData[cachedGroupId]));
        setSelectedGroup(groupData[cachedGroupId]);
        // setSelectedGroup();
      }
      if (channelParam && cachedChannelId) {
        // console.log("restoring channel");
        // console.log(cachedGroupId);
        // console.log(groupData[cachedGroupId].channels.text);
        // retrieveStored.channelId()
        // console.log(setSelectedChannel());
        const channel = groupData[cachedGroupId].channels.text.find(
          (channel) => channel._id === cachedChannelId
        );
        setSelectedChannel(channel);
        // setSelectedChannel();
      }
    }
  }, [dataReady]);
}
