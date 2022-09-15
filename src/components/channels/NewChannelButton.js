import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/outline";

function NewChannelButton(props) {
  return (
    <Link
      to={`/g/${props.for.name}/c/new`}
      className=" w-5/6 m-1 pt-1 pb-1 border-2 border-gray-800 hover:border-transparent hover:bg-gray-600 rounded-lg flex justify-center items-center transition-colors ease-in duration-75 cursor-pointer"
    >
      <PlusIcon className="h-6 w-6" />
    </Link>
  );
}

export default NewChannelButton;
