import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";

import { DotsVerticalIcon, TrashIcon, XIcon } from "@heroicons/react/solid";

import { DataContext } from "../context/DataContext";
import { FlashContext } from "../context/FlashContext";
import { UiContext } from "../context/UiContext";

function ChannelBadge(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [nameField, setNameField] = useState(props.data.name);
  const { groupData, setGroupData } = useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { setFlashMessages } = useContext(FlashContext);
  const navigate = useNavigate();

  const emphasis = props.selected ? "bg-gray-600" : "hover:bg-gray-600";

  // pass name to parent on click
  function passOnClick() {
    props.onClick(props.data);
  }

  function deleteChannel() {
    if (!showDialogue) setShowDialogue(true);
    else {
      const axiosDeleteChannel = axios.create({
        baseURL: "http://localhost:3100",
        withCredentials: true,
      });
      axiosDeleteChannel
        .delete(`/c/${props.data._id}`)
        .then((res) => {
          const tempGroupData = groupData;
          const updatedGroupData = res.data.groupData;

          tempGroupData[props.groupIndex] = updatedGroupData;
          setGroupData(tempGroupData);
          setFlashMessages(res.data.messages);

          navigate(`/g/${selectedGroup.name}`);
        })
        .catch((err) => {
          setFlashMessages(err.response.data.messages);
        });
    }
  }

  function editChannel(e) {
    e.preventDefault();

    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const axiosEditChannel = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });

    const channelData = new FormData();
    channelData.append("name", nameField);

    axiosEditChannel
      .patch(`/c/${props.data._id}`, channelData, axiosConfig)
      .then((res) => {
        const tempGroupData = groupData;
        const channelIndex = tempGroupData[
          props.groupIndex
        ].channels.text.findIndex((ch) => ch._id === res.data.channelData._id);

        tempGroupData[props.groupIndex].channels.text[channelIndex] =
          res.data.channelData;

        setGroupData(tempGroupData);
        setIsEditing(false);
        setShowDialogue(false);
        setFlashMessages(res.data.messages);

        navigate(`/g/${selectedGroup.name}`);
      })
      .catch((err) => {
        console.log(err);
        setIsEditing(false);
        setShowDialogue(false);
        setFlashMessages(err.response.data.messages);
      });
  }

  function toggleEditForm() {
    if (isEditing) {
      setIsEditing(false);
      setShowDialogue(false);
    } else setIsEditing(true);
  }
  if (isEditing && selectedChannel.name !== props.data.name)
    toggleEditForm(false); // useEffect cleanup could do the job as well, or props.selected

  if (isEditing) {
    return (
      <Link
        onClick={passOnClick}
        to={`c/${props.data.name}`}
        className={`h-8 w-5/6 m-0.5 pl-2 py-1 pr-1 ${emphasis} rounded-lg flex justify-between items-center transition-colors ease-in duration-75 group`}
      >
        <div className="w-full h-full flex flex-col items-center">
          <form onSubmit={editChannel}>
            <input
              type="text"
              value={nameField}
              maxLength="20"
              className="w-full bg-gray-600 focus:outline-none"
              onChange={(e) => setNameField(e.target.value)}
              ref={(input) => input && input.focus()}
            />
          </form>
          {showDialogue ? (
            <div className="w-full bg-gray-600 -m-6">Delete channel?</div>
          ) : null}
        </div>
        <TrashIcon
          className="h-6 text-gray-900 hover:text-mexican-red-600 transition-colors ease-in duration-75"
          onClick={deleteChannel}
        />
        <XIcon
          className="h-6 text-gray-900 hover:text-gray-400 transition-colors ease-in duration-75"
          onClick={toggleEditForm}
        />
      </Link>
    );
  } else {
    return (
      <Link
        onClick={passOnClick}
        to={`c/${props.data.name}`}
        className={`h-8 w-5/6 m-0.5 pl-2 py-1 pr-0 ${emphasis} rounded-lg flex justify-between items-center transition-colors ease-in duration-75 group`}
      >
        <div className="truncate">{props.data.name}</div>
        {props.isAdmin ? (
          <DotsVerticalIcon
            className="h-5 w-5 shrink-0 text-gray-900 hover:text-gray-400 opacity-0 group-hover:opacity-100 rounded-full transition-all ease-in duration-75"
            onClick={toggleEditForm}
          />
        ) : null}
      </Link>
    );
  }
}

export default ChannelBadge;
