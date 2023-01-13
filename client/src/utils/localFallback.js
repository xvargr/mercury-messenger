function useLocalFallback() {
  function updateLastGroup(object) {
    localStorage.setItem("lastGroupId", object?._id);
    localStorage.setItem("lastGroupName", object?.name);
  }

  function updateLastChannel(object) {
    localStorage.setItem("lastChannelId", object?._id);
    localStorage.setItem("lastChannelName", object?.name);
  }

  return {
    updateStored: {
      group: updateLastGroup,
      channel: updateLastChannel,
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
