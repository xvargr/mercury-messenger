import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";

//svg
import {
  DotsVerticalIcon,
  TrashIcon,
  XIcon,
  HashtagIcon,
  FolderIcon,
} from "@heroicons/react/solid";

// context
import { DataContext } from "../context/DataContext";
import { FlashContext } from "../context/FlashContext";

// utility hooks
import axiosInstance from "../../utils/axios";

function ChannelBadge(props) {
  const [nameField, setNameField] = useState(props.data.name);
  const emphasis = props.selected ? "bg-gray-600" : "hover:bg-gray-600";

  const [isEditing, setIsEditing] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);

  const {
    selectedGroup,
    selectedChannel,
    setSelectedChannel,
    setGroupData,
    dataHelpers,
  } = useContext(DataContext);

  const { pushFlashMessage } = useContext(FlashContext);

  const navigate = useNavigate();

  const { userChannels } = axiosInstance();

  let Charm;
  switch (props.type) {
    case "text":
      Charm = (
        <HashtagIcon className="w-6 h-6 md:w-5 md:h-5 text-gray-800 shrink-0" />
      );
      break;
    case "task":
      Charm = <FolderIcon className="w-5 h-5 text-gray-800 shrink-0" />;
      break;

    default:
      break;
  }

  function UnreadBadge() {
    if (props.unread <= 0) return null;
    else
      return (
        <div className="w-6 h-6 md:w-5 md:h-5 bg-red-500 text-white font-semibold rounded-full shadow-md flex justify-center items-center overflow-clip absolute">
          {props.unread}
        </div>
      );
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
            const dataCopy = { ...prevData };
            const channelIndex = dataHelpers.getChannelIndex(
              res.data.groupId,
              res.data.channelId
            );
            dataCopy[res.data.groupId].channels.text.splice(channelIndex, 1);
            delete dataCopy[res.data.groupId].chatData[res.data.channelId];
            return dataCopy;
          });

          pushFlashMessage(res.data.messages);
          navigate(`/g/${selectedGroup.name}`);
        })
        .catch((err) => {
          pushFlashMessage(err.response.data.messages);
        });
    }
  }

  function editChannel(e) {
    e.preventDefault();

    const channelData = new FormData();
    channelData.append("name", nameField);
    channelData.append("type", props.data.type);
    channelData.append("group", selectedGroup._id);

    userChannels
      .edit(props.data._id, channelData)
      .then((res) => {
        setGroupData((currData) => {
          const dataCopy = { ...currData };
          const channelIndex = dataHelpers.getChannelIndex(
            selectedGroup.id,
            res.data.channelData._id
          );
          dataCopy[res.data.groupId].channels.text[channelIndex] =
            res.data.channelData;
          return dataCopy;
        });

        setIsEditing(false);
        setShowDialogue(false);
        pushFlashMessage(res.data.messages);
        setSelectedChannel(res.data.channelData);

        navigate(`/g/${selectedGroup.name}/c/${res.data.channelData.name}`);
      })
      .catch((err) => {
        setIsEditing(false);
        setShowDialogue(false);
        pushFlashMessage(err.response.data.messages);
      });
  }

  function toggleEditForm(e) {
    e.preventDefault();
    if (isEditing) {
      setIsEditing(false);
      setShowDialogue(false);
    } else setIsEditing(true);
  }

  function setChannel() {
    setSelectedChannel(props.data);
  }

  if (isEditing && selectedChannel?.name !== props.data.name) {
    setIsEditing(false); // useEffect cleanup could do the job as well, or props.selected
  }

  if (isEditing) {
    return (
      <div
        className={`h-10 w-2/3 md:h-8 md:w-5/6 m-0.5 py-1 px-2 ${emphasis} text-lg md:text-base rounded-lg flex justify-between items-center transition-colors ease-in duration-75 group relative`}
      >
        {Charm}
        <div className="w-full h-full flex min-w-0 flex-col items-center justify-center">
          <form className="w-full relative" onSubmit={editChannel}>
            <input
              type="text"
              value={nameField}
              maxLength="20"
              className="focus:outline-none bg-inherit w-full"
              onChange={(e) => setNameField(e.target.value)}
              ref={(input) => input && input.focus()}
            />
            {!showDialogue || (
              <div className="w-full bg-gray-600 truncate absolute top-0 left-0">
                Delete channel?
              </div>
            )}
          </form>
        </div>
        <TrashIcon
          className="h-6 text-gray-900 hover:text-mexican-red-600 transition-colors ease-in duration-75 shrink-0 cursor-pointer"
          onClick={deleteChannel}
        />
        <XIcon
          className="h-6 text-gray-900 hover:text-gray-400 transition-colors ease-in duration-75 shrink-0 cursor-pointer"
          onClick={(e) => toggleEditForm(e)}
        />
      </div>
    );
  } else {
    return (
      <Link
        onClick={setChannel}
        to={`c/${props.data.name}`}
        className={`h-10 w-2/3 md:h-8 md:w-5/6 m-0.5 py-1 px-2 md:pr-1 ${emphasis} text-lg md:text-base rounded-lg flex justify-between items-center transition-colors ease-in duration-75 group relative`}
      >
        <UnreadBadge />
        <div className="max-w-[85%] flex items-center">
          {Charm}
          <div className="pl-1 truncate">{props.data.name}</div>
        </div>
        {props.isAdmin ? (
          <DotsVerticalIcon
            className="h-5 w-5 shrink-0 text-gray-900 hover:text-gray-400 md:opacity-0 md:group-hover:opacity-100 rounded-full transition-all ease-in duration-75"
            onClick={(e) => toggleEditForm(e)}
          />
        ) : null}
      </Link>
    );
  }
}

export default ChannelBadge;
