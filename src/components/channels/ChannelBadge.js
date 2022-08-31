import { Link, useParams, useNavigate, NavigationType } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";

import { DataContext } from "../context/DataContext";

import { DotsVerticalIcon, TrashIcon, XIcon } from "@heroicons/react/solid";

function ChannelBadge(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [nameField, setNameField] = useState(props.name);
  const { groupData, setGroupData } = useContext(DataContext);
  const navigate = useNavigate();
  const { channel, group } = useParams();

  const emphasis = props.selected ? "bg-gray-600" : "hover:bg-gray-600";

  // pass name to parent on click
  function passOnClick() {
    props.onClick(props.name);
  }

  function deleteChannel() {
    if (!showDialogue) setShowDialogue(true);
    else {
      // const axiosConfig = {
      //   headers: { "Content-Type": "multipart/form-data" },
      // };
      const axiosDeleteChannel = axios.create({
        baseURL: "http://localhost:3100",
        withCredentials: true,
      });
      axiosDeleteChannel
        .delete(`/c/${props.id}`)
        .then((res) => {
          const grpIndex = groupData.findIndex(
            (group) => group.id === res.data.id
          );
          const tempGroupData = groupData;
          const updatedChannelData = res.data;

          tempGroupData[grpIndex] = updatedChannelData;
          setGroupData(tempGroupData);

          navigate(`/g/${group}`);
        })
        .catch((err) => console.log("error:", err));
    }
  }

  // todo channel edit form
  function editChannel(e) {
    e.preventDefault();
    console.log("edit sent");
    // todo send delete req
    // const axiosConfig = {
    //   headers: { "Content-Type": "multipart/form-data" },
    // };
    const axiosEditChannel = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });
    axiosEditChannel
      .patch(`/c/${props.id}`, { newName: nameField }) // ! req.body undefined
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log("error:", err));
    // todo then fetch
  }

  function toggleEditForm() {
    if (isEditing) {
      setIsEditing(false);
      setShowDialogue(false);
    } else setIsEditing(true);
  }
  if (isEditing && channel !== props.name) toggleEditForm(false); // useEffect cleanup could do the job as well, or props.selected

  // * done close form when something else is selected
  // todo delete request
  // todo delete confirmation
  // todo patch request

  // todo error handling

  // todo fetch channels in this group only to save bandwidth
  // todo update this group's groupData
  // todo reload

  if (isEditing) {
    return (
      <Link
        onClick={passOnClick}
        to={`c/${props.name}`}
        className={`h-8 w-5/6 m-0.5 pl-2 py-1 pr-1 ${emphasis} rounded-lg flex justify-between items-center transition-colors ease-in duration-75 group`}
      >
        <div className="w-full h-full flex flex-col items-center">
          <form onSubmit={editChannel}>
            <input
              type="text"
              value={nameField}
              className="w-full bg-gray-600 focus:outline-none"
              onChange={(e) => setNameField(e.target.value)}
              ref={(input) => input && input.focus()}
            />
          </form>
          {showDialogue ? (
            <div className="w-full bg-gray-600 -m-6">Delete channel?</div>
          ) : null}
        </div>
        {/* {isConfirmed ? "confirm" : "unconfirmed"} */}
        <TrashIcon
          className="h-6 text-gray-900 hover:text-mexican-red-600 transition-colors ease-in duration-75"
          onClick={deleteChannel}
        />
        {/* <CheckIcon className="h-6 text-gray-900 hover:text-green-600 transition-colors ease-in duration-75" /> */}
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
        to={`c/${props.name}`}
        className={`h-8 w-5/6 m-0.5 pl-2 py-1 pr-0 ${emphasis} rounded-lg flex justify-between items-center transition-colors ease-in duration-75 group`}
      >
        <div className="truncate">{props.name}</div>
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
