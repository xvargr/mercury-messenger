import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
// components
import NewGroupForm from "../components/forms/NewGroupForm";
import JoinByInvite from "../components/forms/JoinByInvite";
// context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";

function NewGroupPage() {
  const { setGroupMounted } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
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
      baseURL: "http://localhost:3100",
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
        navigate(`/g/${res.data.name}`);
      })
      .catch((err) => {
        setAxiosCreateErr({
          message: err.response.data.message,
          status: err.response.status,
        });
      });
  }

  function joinGroupHandler(link) {
    const axiosNewGroup = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });

    axiosNewGroup
      .post(link)
      .then((res) => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate(`/g/${res.data}`);
      })
      .catch((err) => {
        setAxiosJoinErr({
          message: err.response.data.message,
          status: err.response.status,
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
