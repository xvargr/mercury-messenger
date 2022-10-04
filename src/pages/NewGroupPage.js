import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
// components
import NewGroupForm from "../components/forms/NewGroupForm";
import JoinByInvite from "../components/forms/JoinByInvite";
// context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";

function NewGroupPage() {
  const { setGroupMounted } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const { setFlashMessages } = useContext(FlashContext);
  const [axiosCreateErr, setAxiosCreateErr] = useState({
    message: null,
    status: null,
  });
  const [axiosJoinErr, setAxiosJoinErr] = useState({
    message: null,
    status: null,
  });
  const navigate = useNavigate();

  function newGroupHandler(groupObject) {
    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const axiosNewGroup = axios.create({
      baseURL: `${window.location.protocol}//${window.location.hostname}:3100`,
      withCredentials: true,
    });

    let newGroupData = new FormData();
    newGroupData.append("name", groupObject.name);
    newGroupData.append("file", groupObject.image);

    axiosNewGroup
      .post("/g", newGroupData, axiosConfig)
      .then((res) => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        setFlashMessages(res.data.messages);

        navigate(`/g/${res.data.groupData.name}`);
      })
      .catch((err) => {
        setAxiosCreateErr({
          message: err.response.data.messages[0].message, // ! fis to json response format
        });
      });
  }

  function joinGroupHandler(link) {
    const axiosNewGroup = axios.create({
      baseURL: `${window.location.protocol}//${window.location.hostname}:3100`,
      withCredentials: true,
    });

    axiosNewGroup
      .post(link)
      .then((res) => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        setFlashMessages(res.data.messages);

        navigate(`/g/${res.data.groupData.name}`);
      })
      .catch((err) => {
        console.log(err);
        setAxiosJoinErr({
          message: err.response.data.messages[0].message,
        });
      });
  }

  return (
    <div className="bg-gray-700 w-full flex flex-col justify-evenly items-center bgHeroDiagDark">
      <NewGroupForm onNewGroup={newGroupHandler} err={axiosCreateErr} />
      <JoinByInvite onJoinGroup={joinGroupHandler} err={axiosJoinErr} />
    </div>
  );
}

export default NewGroupPage;
