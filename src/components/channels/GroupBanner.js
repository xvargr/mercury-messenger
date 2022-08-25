import { useState, useContext } from "react";
// context
import { DataContext } from "../context/DataContext";
import { UiContext } from "../context/UiContext";
// components
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";

function GroupBanner(props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { groupData, groupMounted } = useContext(DataContext);
  const { selectedChannel, selectedGroup } = useContext(UiContext);

  console.log("groupData", groupData);
  console.log("groupMounted", groupMounted);
  console.log("selectedChannel", selectedChannel);
  console.log("selectedGroup", selectedGroup);

  // todo delete channel

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

  function TrayExpanded() {
    return (
      <div className="w-1/4 px-2 py-4 bg-gray-900 text-gray-400 rounded-b-lg fixed top-10 flex flex-col justify-center items-center">
        <div className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-slate-700">
          INVITE
        </div>
        <div className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-slate-700">
          SETTINGS
        </div>
        <div className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-slate-700">
          LEAVE
        </div>
        <div className="w-5/6 mx-4 my-1 px-4 py-1 text-center rounded-lg bg-slate-700">
          DELETE GROUP
        </div>
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
