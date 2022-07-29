import { Link } from "react-router-dom";

function NewGroupButton() {
  return (
    <Link to={"/g/new"} key="new">
      <div className="bg-slate-700 m-3 mr-0 h-14 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in flex items-center justify-around">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </Link>
  );
}

export default NewGroupButton;
