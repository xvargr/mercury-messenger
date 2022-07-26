import { Link, Outlet } from "react-router-dom";

function GroupsBar() {
  return (
    <div>
      <nav className="bg-slate-800 h-screen w-20 overflow-y-auto overflow-x-hidden scrollbar-none">
        <Link to="/user">
          <span className="bg-slate-700 m-2 p-4 h-16 w-16 rounded-3xl inline-block hover:rounded-lg transition-all ease-in"></span>
        </Link>
        <hr className="m-2 mb-0 mt-0 border-slate-400" />
        {/* <span className="bg-[url('https://picsum.photos/100/100')] m-2 mr-0 p-4 h-14 w-full rounded-l-lg inline-block"></span> */}
        <Link to={"/chats/group-1"}>
          <img
            src={require("../assets/images/otter.jpg")}
            alt="otter"
            className="m-3 mr-0 h-14 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in"
          />
        </Link>
        <Link to={"/chats/group-2"}>
          <img
            src="https://picsum.photos/100/100"
            alt="otter"
            className="m-3 mr-0 h-14 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in"
          />
        </Link>
        <Link to={"/chats/group-3"}>
          <img
            src="https://picsum.photos/100/100?random=1"
            alt="otter"
            className="m-3 mr-0 h-14 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in"
          />
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default GroupsBar;
