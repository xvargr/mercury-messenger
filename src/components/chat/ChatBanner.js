import { useContext } from "react";
import { Link } from "react-router-dom";
import { ChevronDoubleLeftIcon } from "@heroicons/react/solid";

import { DataContext } from "../context/DataContext";

function ChannelBanner(props) {
  const { pending } = props;
  const { selectedGroup, setSelectedChannel } = useContext(DataContext);

  return (
    <div className="w-full h-10 bg-gray-800 flex justify-center items-center text-gray-400 font-montserrat z-30">
      {pending || (
        <Link
          className="opacity-80 md:opacity-0 md:pointer-events-none"
          to={`/g/${selectedGroup.name}`}
          onClick={() => setSelectedChannel(null)}
        >
          <ChevronDoubleLeftIcon className="h-10 p-1 pr-2 absolute top-0 left-0 bg-gray-700 hover:bg-gray-600 rounded-r-full shadow-md transition-colors duration-150" />
        </Link>
      )}
      <div className="m-2">{props.name}</div>
    </div>
  );
}

export default ChannelBanner;
