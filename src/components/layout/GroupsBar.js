import { Link, Outlet } from "react-router-dom";

import GroupBadge from "../groups/GroupBadge";

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
        name: "Channel 3",
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
        name: "Channel 3",
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
        name: "Channel 3",
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
        name: "Channel 3",
      },
    ],
  },
];

function GroupsBar() {
  return (
    <div>
      <nav className="bg-slate-800 h-screen w-20 overflow-y-auto overflow-x-hidden scrollbar-none">
        <Link to="/user">
          <span className="bg-slate-700 m-2 p-4 h-16 w-16 rounded-3xl inline-block hover:rounded-lg transition-all ease-in"></span>
        </Link>

        <hr className="m-2 mb-0 mt-0 border-slate-400" />

        {DUMMY_DATA.map((group) => {
          return (
            <GroupBadge name={group.name} img={group.img} key={group.id} />
          );
        })}
      </nav>
      <Outlet />
    </div>
  );
}

export default GroupsBar;
