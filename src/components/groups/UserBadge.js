import { useMemo, useContext } from "react";
import { Link } from "react-router-dom";

import { DataContext } from "../context/DataContext";
import useSocket from "../../utils/socket";

function UserBadge(props) {
  const { setSelectedGroup, setSelectedChannel, peerData, peerHelpers } =
    useContext(DataContext);
  const { forceStatusUpdate } = useSocket();

  const userStatus = useMemo(
    () => peerHelpers.getStatus(localStorage.userId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [peerData]
  );

  let statusIndicator;
  let nextStatus;
  switch (userStatus) {
    case "online":
      statusIndicator = "border-2 bg-green-500";
      nextStatus = "away";
      break;

    case "away":
      statusIndicator = "border-2 bg-yellow-500";
      nextStatus = "busy";
      break;

    case "busy":
      statusIndicator = "border-2 bg-red-500";
      nextStatus = "offline";
      break;

    case "offline":
      statusIndicator = "border-2 bg-gray-600";
      nextStatus = "online";
      break;

    default:
      break;
  }

  function StatusButton() {
    return (
      <span
        title={`change status to ${nextStatus}`}
        className={`w-2.5 h-2.5 group-hover:w-3 group-hover:h-3 ${statusIndicator} rounded-full border-solid border-4 box-content border-gray-800 absolute right-1.5 bottom-1.5 transition-all ease-in-out duration-200`}
        onClick={(e) => forceStatusUpdate(nextStatus)}
      ></span>
    );
  }

  if (props.loading) {
    return (
      <div className="bg-gray-700 h-16 w-16 m-2 mt-0 rounded-2xl inline-block transition-all animate-pulse" />
    );
  } else {
    return (
      <Link
        className="relative group"
        to="/u"
        onClick={(e) => {
          e.nativeEvent.stopImmediatePropagation(); // prevents nav to /user from clicking status button
          setSelectedChannel(null);
          setSelectedGroup(null);
        }}
      >
        <img
          src={localStorage.userImageSmall}
          className="bg-gray-700 h-16 w-16 m-2 mt-0 object-cover rounded-2xl inline-block group-hover:rounded-lg transition-all ease-in"
          alt="profile"
        />
        <StatusButton />
      </Link>
    );
  }
}

export default UserBadge;
