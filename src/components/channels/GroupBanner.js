import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
// components
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import InviteButton from "../ui/InviteButton";

function GroupBanner(props) {
  const [isExpanded, setIsExpanded] = useState(false);
  // const [inviteLinkShown, setInviteLinkShown] = useState(false);
  // const [inviteLink, setInviteLink] = useState("");
  const { groupData, groupMounted, setGroupMounted } = useContext(DataContext);
  const { selectedGroup, setSelectedChannel, setSelectedGroup } =
    useContext(UiContext);
  const navigate = useNavigate();

  const axiosConfig = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  const axiosUser = axios.create({
    baseURL: "http://localhost:3100",
    withCredentials: true,
  });

  let inviteLink;
  if (groupMounted) {
    inviteLink = groupData.find(
      (group) => group.name === selectedGroup
    ).inviteLink;
  }

  function expandHandler() {
    isExpanded ? setIsExpanded(false) : setIsExpanded(true);
  }

  function TrayCollapsed() {
    return (
      <div
        className="w-12 bg-gray-800 rounded-b-lg fixed top-10 flex justify-center items-center cursor-pointer"
        onClick={expandHandler}
      >
        <ChevronDownIcon className="h-3 w-3" />
      </div>
    );
  }

  function leaveGroup() {
    const group = groupData.find((group) => group.name === selectedGroup);

    axiosUser
      .patch(`/g/${group._id}`, axiosConfig)
      .then((res) => {
        console.log("success:", res);
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate("/");
      })
      .catch((err) => console.log("error:", err));
  }

  function TrayExpanded() {
    return (
      <div className="w-1/4 px-2 py-4 bg-gray-900 text-gray-400 rounded-b-lg fixed top-10 flex flex-col justify-center items-center">
        <InviteButton inviteLink={inviteLink} />
        <div className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-slate-700">
          SETTINGS
        </div>
        <button
          className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-slate-700"
          onClick={leaveGroup}
        >
          LEAVE
        </button>
        {/* <button
          className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-slate-700"
          onClick={leaveGroup}
        >
          DELETE GROUP
        </button> */}
        <div
          className="w-12 bg-slate-900 rounded-b-lg flex items-center justify-center absolute -bottom-3 cursor-pointer"
          onClick={expandHandler}
        >
          <ChevronUpIcon className="h-3 w-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-10 bg-gray-800 flex justify-center items-center">
      <div className="m-2 text-gray-400 truncate font-montserrat">
        {props.name}
      </div>
      {isExpanded ? <TrayExpanded /> : <TrayCollapsed />}
    </div>
  );
}

export default GroupBanner;
