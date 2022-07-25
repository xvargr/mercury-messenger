import { Link } from "react-router-dom";

function GroupsBar() {
  return (
    <nav className="bg-slate-800 h-screen w-20 overflow-y-auto overflow-x-hidden scrollbar-none">
      <Link to="/">
        <span className="bg-slate-700 m-2 p-4 h-16 w-16 rounded-full inline-block"></span>
      </Link>
      <hr className="m-2 mb-0 mt-0 border-slate-400" />
      {/* <span className="bg-[url('https://picsum.photos/100/100')] m-2 mr-0 p-4 h-14 w-full rounded-l-lg inline-block"></span> */}
      <Link to={"/chats"}>
        <img
          src={require("../assets/images/otter.jpg")}
          alt="otter"
          className="m-3 mr-0 h-14 w-full rounded-l-lg object-cover"
        />
      </Link>
      <Link to={"/chats"}>
        <img
          src="https://picsum.photos/100/100"
          alt="otter"
          className="m-3 mr-0 h-14 w-full rounded-l-lg object-cover"
        />
      </Link>
      <Link to={"/chats"}>
        <img
          src="https://picsum.photos/100/100?random=1"
          alt="otter"
          className="m-3 mr-0 h-14 w-full rounded-l-lg object-cover"
        />
      </Link>
    </nav>
  );
}

export default GroupsBar;
