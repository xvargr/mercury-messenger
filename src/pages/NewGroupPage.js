import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
// components
import NewGroupForm from "../components/forms/NewGroupForm";
import JoinByInvite from "../components/forms/JoinByInvite";
// context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";
// utility hooks
import axiosInstance from "../utils/axios";

function NewGroupPage() {
  const { dataHelpers } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const [axiosCreateErr, setAxiosCreateErr] = useState({
    message: null,
    status: null,
  });
  const [axiosJoinErr, setAxiosJoinErr] = useState({
    message: null,
    status: null,
  });
  const { userGroups } = axiosInstance();
  const navigate = useNavigate();

  function newGroupHandler(groupObject) {
    let newGroupData = new FormData();
    newGroupData.append("name", groupObject.name);
    newGroupData.append("file", groupObject.image);

    userGroups
      .new(newGroupData)
      .then((res) => {
        dataHelpers.addNewGroup(res.data.newGroup);

        setSelectedGroup(res.data.newGroup);
        setSelectedChannel(null);

        pushFlashMessage(res.data.messages);
        navigate(`/g/${res.data.newGroup.name}`);
      })
      .catch((err) => {
        setAxiosCreateErr({
          message: err.response.data.messages[0].message,
        });
      });
  }

  function joinGroupHandler(joinCode) {
    userGroups
      .join(joinCode)
      .then((res) => {
        dataHelpers.addNewGroup(res.data.joinedGroup, res.data.chatData);

        setSelectedGroup(res.data.joinedGroup);
        setSelectedChannel(null);

        pushFlashMessage(res.data.messages);
        navigate(`/g/${res.data.joinedGroup.name}`);
      })
      .catch((err) => {
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
