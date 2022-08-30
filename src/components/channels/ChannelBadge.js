import { useState } from "react";
import { Link } from "react-router-dom";
import { DotsVerticalIcon, TrashIcon } from "@heroicons/react/solid";

function ChannelBadge(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameField, setNameField] = useState(props.name);

  const emphasis =
    props.selected === true ? "bg-gray-600" : "hover:bg-gray-600";

  // pass name to parent onclick
  function passOnClick() {
    props.onClick(props.name);
  }

  function toggleEditForm() {
    if (isEditing) setIsEditing(false);
    else setIsEditing(true);
  }

  function nameOnChange(e) {
    setNameField(e.target.value);
  }
  console.log("nameField", nameField);

  // todo channel edit form
  if (isEditing) {
    return (
      <Link
        onClick={passOnClick}
        to={`c/${props.name}`}
        className={`h-8 w-5/6 m-0.5 pl-2 py-1 pr-0 ${emphasis} rounded-lg flex justify-between items-center transition-colors ease-in duration-75 group`}
      >
        <input
          type="text"
          value={nameField}
          className="w-full"
          onChange={nameOnChange}
        />
        <TrashIcon />
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
