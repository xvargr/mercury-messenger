import { Link, Outlet } from "react-router-dom";

import GroupBadge from "../ui/groups/GroupBadge";
import NewGroupButton from "../ui/groups/NewGroupButton";

const DUMMY_DATA = [
  {
    id: "01",
    name: "group-1",
    description: "lorem",
    img: "https://picsum.photos/100/100?random=1",
    channels: [
      {
        name: "Channel 1",
      },
      {
        name: "Channel 2",
      },
      {
        name: "Incredibly long channel name",
      },
    ],
  },
  {
    id: "02",
    name: "group-2",
    description: "lorem",
    img: "https://picsum.photos/100/100?random=2",
    channels: [
      {
        name: "Channel 1",
      },
      {
        name: "Channel 2",
      },
      {
        name: "Incredibly long channel name",
      },
    ],
  },
  {
    id: "03",
    name: "group-3",
    description: "lorem",
    img: "https://picsum.photos/100/100?random=3",
    channels: [
      {
        name: "Channel 1",
      },
      {
        name: "Channel 2",
      },
      {
        name: "Incredibly long channel name",
      },
    ],
  },
  {
    id: "04",
    name: "group-4",
    description: "lorem",
    img: "https://picsum.photos/100/100?random=4",
    channels: [
      {
        name: "Channel 1",
      },
      {
        name: "Channel 2",
      },
      {
        name: "Incredibly long channel name",
      },
    ],
  },
];

function GroupsBar() {
  return (
    <div className="h-screen flex relative">
      <nav className="bg-slate-800 flex-grow w-20 flex flex-col overflow-hidden">
        <div className="w-full h-10 bg-slate-800 text-mexican-red-600 flex justify-center items-center font-montserrat font-semibold">
          <div className="m-2">MERC.</div>
        </div>

        <Link to="/u">
          <span className="bg-slate-700 m-2 mt-0 p-4 h-16 w-16 rounded-2xl inline-block hover:rounded-lg transition-all ease-in"></span>
        </Link>

        <hr className="m-2 mb-0 mt-0 border-slate-600" />

        <div className="w-full flex-grow overflow-y-scroll overflow-x-hidden scrollbar-none">
          {DUMMY_DATA.map((group) => {
            return (
              <GroupBadge name={group.name} img={group.img} key={group.id} />
            );
          })}
          <NewGroupButton />
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

export default GroupsBar;
