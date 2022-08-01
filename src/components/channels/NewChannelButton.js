import { Link, useParams } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/outline";

function NewChannelButton() {
  const { group } = useParams();
  return (
    <Link
      to={`/g/${group}/c/new`}
      className=" w-5/6 m-1 pt-1 pb-1 border-2 border-gray-600 hover:bg-gray-600 rounded-lg flex justify-center items-center transition-colors ease-in duration-75 cursor-pointer"
    >
      <PlusIcon className="h-6 w-6" />
    </Link>
  );
}

export default NewChannelButton;
