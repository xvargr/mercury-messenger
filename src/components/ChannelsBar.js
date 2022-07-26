import { Link, useParams } from "react-router-dom";

function ChannelsBar() {
  const { group } = useParams();

  return (
    <div className="bg-slate-700 h-screen p-2 w-1/4 overflow-y-auto overflow-x-hidden scrollbar-dark flex flex-col">
      <div>In {group}</div>
      <Link
        to={"chanel-1"}
        className="hover:bg-slate-600 m-1 p-1 rounded-lg inline-block"
      >
        Chanel 1
      </Link>
      <Link
        to={"chanel-2"}
        className="hover:bg-slate-600 m-1 p-1 rounded-lg inline-block"
      >
        Chanel 2
      </Link>
      <Link
        to={"chanel-3"}
        className="hover:bg-slate-600 m-1 p-1 rounded-lg inline-block"
      >
        Chanel 3
      </Link>
    </div>
  );
}

export default ChannelsBar;
