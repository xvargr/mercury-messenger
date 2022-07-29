import { Link, useParams } from "react-router-dom";

function NewChannelButton() {
  const { group } = useParams();
  return (
    <Link
      to={`/g/${group}/c/new`}
      className=" w-5/6 m-1 pt-1 pb-1 border-2 border-slate-600 hover:bg-slate-600 rounded-lg flex justify-center items-center transition-colors ease-in duration-75 cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </Link>
  );
}

export default NewChannelButton;
