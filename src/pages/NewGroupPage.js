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

  const axiosConfig = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  const axiosNewGroup = axios.create({
    baseURL: "http://localhost:3100",
    withCredentials: true,
  });

  function newGroupHandler(groupObject) {
    let newGroupData = new FormData();
    newGroupData.append("name", groupObject.name);
    newGroupData.append("file", groupObject.image);

    axiosNewGroup
      .post("/g", newGroupData, axiosConfig)
      .then((res) => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate("/");
      })
      .catch((err) => {
        setAxiosCreateErr({
          message: err.response.data.message,
          status: err.response.status,
        });
      });
  }

  function joinGroupHandler(link) {
    console.log(link);
    axiosNewGroup
      .post(link, axiosConfig)
      .then((res) => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate("/"); // todo nav to joined group res.link?
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
