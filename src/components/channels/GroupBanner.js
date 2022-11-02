import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
import { FlashContext } from "../context/FlashContext";
// components
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import InviteButton from "../ui/InviteButton";
// utility hooks
import axiosInstance from "../../utils/axios";

function GroupBanner(props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setFlashMessages } = useContext(FlashContext);
  const { groupMounted, setGroupMounted } = useContext(DataContext);
  const { selectedGroup, clearSelected } = useContext(UiContext);
  const navigate = useNavigate();
  const { userGroups } = axiosInstance();

  let inviteLink;
  let isAdmin;
  if (groupMounted && selectedGroup !== null) {
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

  function leaveGroup() {
    userGroups
      .leave(selectedGroup._id)
      .then((res) => {
        clearSelected();
        setGroupMounted(false);
        setFlashMessages(res.data.messages);

        navigate("/");
      })
      .catch((err) => {
        setFlashMessages(err.response.data.messages);
      });
  }

  function deleteGroup() {
    userGroups
      .delete(selectedGroup._id)
      .then((res) => {
        console.log("in then delete group");
        clearSelected();
        setGroupMounted(false);
        setFlashMessages(res.data.messages);

        navigate("/");
      })
      .catch((err) => {
        setFlashMessages(err.response.data.messages);
      });
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
      <div className="w-1/5 px-2 py-4 bg-gray-900 text-gray-400 rounded-b-lg fixed top-10 flex flex-col justify-center items-center">
        <InviteButton inviteLink={inviteLink} />
        {isAdmin ? <AdminOptions /> : null}
        <button
          className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-gray-700"
          onClick={leaveGroup}
        >
          LEAVE
        </button>
        <div
          className="w-12 h-3 bg-gray-900 rounded-b-lg flex items-center justify-center absolute -bottom-3  hover:h-4 hover:translate-y-1 transition-all cursor-pointer group"
          onClick={expandHandler}
        >
          <ChevronUpIcon className="h-4 w-3 text-gray-700 group-hover:text-gray-500 transition-colors" />
        </div>
      </div>
    );
  }

  function TrayCollapsed() {
    return (
      <div
        className="w-12 h-3 bg-gray-800 rounded-b-lg fixed top-10 flex justify-center items-center hover:h-4 transition-all cursor-pointer group"
        onClick={expandHandler}
      >
        <ChevronDownIcon className="h-3 w-3 text-gray-700 group-hover:text-gray-500 transition-colors" />
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
