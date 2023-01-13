import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/outline";

function NewGroupButton() {
  return (
    <Link to={"/g/new"} key="new">
      <div
        title="new group"
        className="bg-gray-700 m-3 mr-0 h-14 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in flex items-center justify-around"
      >
        <PlusIcon className="h-6 w-6 mr-2" />
      </div>
    </Link>
  );
}

export default NewGroupButton;
