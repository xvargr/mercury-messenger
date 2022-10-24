import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosRetry from "axios-retry";

export default function useAxiosInstance() {
  const navigate = useNavigate();

  // axios instance config
  const instanceConfig = {
    baseURL: `${window.location.protocol}//${window.location.hostname}:3100`, // ! temporary
    withCredentials: true,
  };

  // axios request config
  const requestConfig = {
    headers: { "Content-Type": "multipart/form-data" },
  };

  // axios abort controllers
  const fetchController = new AbortController();
  const deleteChannelController = new AbortController();
  const editChannelController = new AbortController();
  const newChannelController = new AbortController();
  const leaveGroupController = new AbortController();
  const deleteGroupController = new AbortController();
  const signUserController = new AbortController();
  const newGroupController = new AbortController();
  const joinGroupController = new AbortController();
  const logOutController = new AbortController();
  const deleteUserController = new AbortController();
  const editUserController = new AbortController();

  // retry config
  const infiniteRetry = {
    retries: Infinity, // number of retries
    retryDelay: () => 5000, // accepts a function, has retryCount passed to it, must return a number
  };
  const threeRetries = {
    retries: 3, // number of retries
    retryDelay: () => 5000, // accepts a function, has retryCount passed to it, must return a number
  };

  // retry conditions
  function toLoginOnUnauthorized(err) {
    // if retry condition is not specified, by default idempotent requests are retried
    const noRetryCodes = [400, 403, 404];

    if (err.response.status === 401) navigate("/login");
    else if (noRetryCodes.includes(err.response.status)) return false;
    else return true;
  }

  // axios instances
  function fetchGroups() {
    const fetchGroupsInstance = axios.create(instanceConfig);

    const config = { ...requestConfig };
    config.signal = fetchController.signal;

    axiosRetry(fetchGroupsInstance, {
      ...infiniteRetry,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return fetchGroupsInstance.get("/g", config);
  }

  function deleteChannel(idString) {
    const deleteChannelInstance = axios.create(instanceConfig);

    const config = { ...requestConfig };
    config.signal = deleteChannelController.signal;

    axiosRetry(deleteChannelInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return deleteChannelInstance.delete(`/c/${idString}`, config);
  }

  function editChannel(idString, data) {
    const editChannelInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = editChannelController.signal;

    axiosRetry(editChannelInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return editChannelInstance.patch(`/c/${idString}`, data, config);
  }

  function newChannel(data) {
    const newChannelInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = newChannelController.signal;

    axiosRetry(newChannelInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return newChannelInstance.post("/c", data, config);
  }

  function leaveGroup(idString) {
    const leaveGroupInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = leaveGroupController.signal;

    axiosRetry(leaveGroupInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return leaveGroupInstance.patch(`/g/${idString}`, config);
  }

  function deleteGroup(idString) {
    const deleteGroupInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = leaveGroupController.signal;

    axiosRetry(deleteGroupInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return deleteGroupInstance.delete(`/g/${idString}`, config);
  }

  function signUser(route, data) {
    const userSignInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = signUserController.signal;

    axiosRetry(userSignInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return userSignInstance.post(route, data, config);
  }

  function newGroup(data) {
    const newGroupInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = signUserController.signal;

    axiosRetry(newGroupInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return newGroupInstance.post("/g", data, config);
  }

  function joinGroup(code) {
    const joinGroupInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = joinGroupController.signal;

    axiosRetry(joinGroupInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return joinGroupInstance.post(code, config);
  }

  function logOut() {
    const logOutInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = logOutController.signal;

    axiosRetry(logOutInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return logOutInstance.delete("/u", config);
  }

  function deleteUser(userId, data) {
    const deleteUserInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = deleteUserController.signal;

    axiosRetry(deleteUserInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return deleteUserInstance.put(`/u/${userId}`, data, config);
  }

  function editUser(userId, data) {
    const editUserInstance = axios.create(instanceConfig);
    const config = { ...requestConfig };
    config.signal = editUserController.signal;

    axiosRetry(editUserInstance, {
      ...threeRetries,
      retryCondition: (err) => toLoginOnUnauthorized(err),
    });

    return editUserInstance.patch(`/u/${userId}`, data, config);
  }

  // axios abort calls
  function abortFetch() {
    fetchController.abort();
  }
  function abortChannelDelete() {
    deleteChannelController.abort();
  }
  function abortChannelEdit() {
    deleteChannelController.abort();
  }
  function abortChannelCreate() {
    newChannelController.abort();
  }
  function abortGroupLeave() {
    leaveGroupController.abort();
  }
  function abortGroupDelete() {
    deleteGroupController.abort();
  }
  function abortUserSign() {
    signUserController.abort();
  }
  function abortGroupCreate() {
    newGroupController.abort();
  }
  function abortGroupJoin() {
    joinGroupController.abort();
  }
  function abortLogOut() {
    joinGroupController.abort();
  }
  function abortDeleteUser() {
    deleteUserController.abort();
  }
  function abortEditUser() {
    editUserController.abort();
  }

  return {
    userAccount: {
      sign: signUser,
      edit: editUser,
      delete: deleteUser,
      logOut,
      abortSign: abortUserSign,
      abortEdit: abortEditUser,
      abortDelete: abortDeleteUser,
      abortLogOut,
    },
    userGroups: {
      fetch: fetchGroups,
      new: newGroup,
      join: joinGroup,
      leave: leaveGroup,
      delete: deleteGroup,
      abortFetch,
      abortNew: abortGroupCreate,
      abortJoin: abortGroupJoin,
      abortLeave: abortGroupLeave,
      abortDelete: abortGroupDelete,
    },
    userChannels: {
      new: newChannel,
      edit: editChannel,
      delete: deleteChannel,
      abortNew: abortChannelCreate,
      abortEdit: abortChannelEdit,
      abortDelete: abortChannelDelete,
    },
  };
}
