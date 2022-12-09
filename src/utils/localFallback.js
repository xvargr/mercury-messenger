// import { useContext } from "react";

// import { UiContext } from "../components/context/UiContext";

// console.log("INIT");

function useLocalFallback() {
  //   const { selectedGroup, selectedChannel } = useContext(UiContext);

  function updateLastGroup(object) {
    console.log("last group cached");
    localStorage.setItem("lastGroupId", object?._id);
    // localStorage.setItem("lastGroupId", selectedGroup._id);
    localStorage.setItem("lastGroupName", object?._name);
    // localStorage.setItem("lastGroupName", selectedGroup._id);
  }

  function updateLastChannel(object) {
    console.log("last channel cached");
    localStorage.setItem("lastChannelId", object?._id);
    // localStorage.setItem("lastChannelId", selectedChannel._id);
    localStorage.setItem("lastChannelName", object?.name);
    // localStorage.setItem("lastChannelName", selectedChannel._id);
  }
  //   function updateLastLocation() {}

  return {
    updateStored: {
      //   all: () => {
      //     updateLastGroup();
      //     updateLastChannel();
      //   },
      group: updateLastGroup,
      channel: updateLastChannel,
      //   lastLocation: updateLastLocation,
    },
    retrieveStored: {
      groupId: () => localStorage.lastGroupId,
      groupName: () => localStorage.lastGroupName,
      channelId: () => localStorage.lastChannelId,
      channelName: () => localStorage.lastChannelName,
    },
  };
}

export default useLocalFallback;
