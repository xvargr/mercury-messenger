import { ChevronDownIcon } from "@heroicons/react/solid";

function GroupBanner(props) {
  return (
    <div className="w-full h-10 bg-gray-800 flex justify-center items-center">
      <div className="w-full m-2 text-gray-400 truncate font-montserrat">
        {props.name}
      </div>
      <div className="w-12 bg-gray-800 rounded-b-lg fixed top-10 flex justify-center items-center">
        <ChevronDownIcon className="h-3 w-3" />
      </div>
    </div>
  );
}

export default GroupBanner;
