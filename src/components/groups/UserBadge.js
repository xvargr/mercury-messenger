import { useEffect, useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";

import { DataContext } from "../context/DataContext";

function UserBadge() {
  // const [status, setStatus] = useState("offline");
  const { peerData, peerHelpers } = useContext(DataContext);
  // console.log(peerData);
  // console.log(localStorage.userId);
  // console.log(peerData[localStorage.userId].status);

  const userStatus = useMemo(
    () => peerHelpers.getStatus(localStorage.userId),
    // return peerData[localStorage.userId]?.status ?? "offline";
    [peerData]
  );

  // console.log(dataReady);
  // console.log(peerData);
  // console.log(localStorage.userId);
  // console.log("userStatus", userStatus);
  // console.log("getStatus", peerHelpers.getStatus(localStorage.userId));

  // useEffect(() => {
  //   setStatus(localStorage.userStatus);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [localStorage]);

  let statusIndicator;
  switch (userStatus) {
    case "online":
      statusIndicator = "border-2 bg-green-500 hover:bg-yellow-500";
      break;

    case "away":
      statusIndicator = "border-2 bg-yellow-500 hover:bg-red-500";
      break;

    case "busy":
      statusIndicator = "border-2 bg-red-500 hover:bg-gray-500";
      break;

    case "offline":
      statusIndicator = "border-2 bg-gray-600 hover:bg-green-500";
      break;

    default:
      break;
  }

  function StatusButton(params) {
    return (
      <span
        className={`w-2.5 h-2.5 ${statusIndicator} rounded-full border-solid border-4 box-content border-gray-800 absolute right-1.5 bottom-1.5 transition-colors ease-in-out duration-200`}
      ></span>
    );
  }

  return (
    <Link className="relative group" to="/u">
      <img
        src={localStorage.userImageSmall}
        className="bg-gray-700 h-16 w-16 m-2 mt-0 object-cover rounded-2xl inline-block group-hover:rounded-lg transition-all ease-in"
        alt="profile"
      />
      <StatusButton />
    </Link>
  );
}

export default UserBadge;
