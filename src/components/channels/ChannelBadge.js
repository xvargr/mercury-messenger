import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";

import { DotsVerticalIcon, TrashIcon, XIcon } from "@heroicons/react/solid";

import { DataContext } from "../context/DataContext";
import { FlashContext } from "../context/FlashContext";
import { UiContext } from "../context/UiContext";

import axiosInstance from "../../utils/axios";

function ChannelBadge(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [nameField, setNameField] = useState(props.data.name);
  const { setGroupData, setChatData, getChannelIndex } =
    useContext(DataContext);
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { setFlashMessages } = useContext(FlashContext);
  const navigate = useNavigate();
  const { userChannels } = axiosInstance();

  const emphasis = props.selected ? "bg-gray-600" : "hover:bg-gray-600";

  // pass name to parent on click
  function passOnClick() {
    props.onClick(props.data);
  }

  useEffect(() => {
    return () => {
      userChannels.abortDelete();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function deleteChannel() {
    if (!showDialogue) setShowDialogue(true);
    else {
      userChannels
        .delete(props.data._id)
        .then((res) => {
          setGroupData((prevData) => {
            const dataCopy = [...prevData];
            const channelIndex = getChannelIndex(
              res.data.groupId,
              res.data.channelId
            );
            dataCopy[props.groupIndex].channels.text.splice(channelIndex, 1);
            return dataCopy; // ? admin bug fixed
          });

          setChatData((prevData) => {
            const dataCopy = { ...prevData };
            delete dataCopy[res.data.groupId][res.data.channelId];
            return dataCopy;
          });

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

    const channelData = new FormData();
    channelData.append("name", nameField);

    userChannels
      .edit(props.data._id, channelData)
      .then((res) => {
        setGroupData((currData) => {
          const dataCopy = [...currData];
          const channelIndex = getChannelIndex(
            selectedGroup.id,
            res.data.channelData._id
          );
          dataCopy[props.groupIndex].channels.text[channelIndex] =
            res.data.channelData;
          return dataCopy;
        });

        setIsEditing(false);
        setShowDialogue(false);
        setFlashMessages(res.data.messages);

        navigate(`/g/${selectedGroup.name}`);
      })
      .catch((err) => {
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
