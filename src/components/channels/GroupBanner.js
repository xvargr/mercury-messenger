import { useState, useContext, useEffect } from "react";
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
  const { groupMounted, setGroupMounted } = useContext(DataContext);
  const { selectedGroup, setSelectedChannel, setSelectedGroup } =
    useContext(UiContext);
  const navigate = useNavigate();

  let inviteLink;
  let isAdmin;
  if (groupMounted) {
    inviteLink = selectedGroup.inviteLink;

    isAdmin = selectedGroup.administrators.some(
      (admin) => admin._id === localStorage.userId
    );
  }

  // close dropdown on group change
  useEffect(() => {
    return () => {
      setIsExpanded(false);
    };
  }, [selectedGroup]);

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
    const axiosUserLeave = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });

    axiosUserLeave
      .patch(`/g/${selectedGroup._id}`)
      .then((res) => {
        // console.log("success:", res);
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate("/");
      })
      .catch((err) => console.log("error:", err));
  }

  function deleteGroup() {
    const axiosUserDelete = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });

    axiosUserDelete
      .delete(`/g/${selectedGroup._id}`)
      .then((res) => {
        console.log("success:", res);
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate("/");
      })
      .catch((err) => console.log("error:", err));
  }

  function AdminOptions() {
    return (
      <>
        <button className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-gray-700">
          SETTINGS
        </button>
        <button
          className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-gray-700"
          onClick={deleteGroup}
        >
          DELETE GROUP
        </button>
      </>
    );
  }

  function TrayExpanded() {
    return (
      <div className="w-1/4 px-2 py-4 bg-gray-900 text-gray-400 rounded-b-lg fixed top-10 flex flex-col justify-center items-center">
        <InviteButton inviteLink={inviteLink} />
        {isAdmin ? <AdminOptions /> : null}
        <button
          className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-gray-700"
          onClick={leaveGroup}
        >
          LEAVE
        </button>
        <div
          className="w-12 bg-gray-900 rounded-b-lg flex items-center justify-center absolute -bottom-3 cursor-pointer"
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
