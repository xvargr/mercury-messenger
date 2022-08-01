import { Outlet } from "react-router-dom";
// components
import GroupBadge from "../groups/GroupBadge";
import NewGroupButton from "../groups/NewGroupButton";
import Logo from "../groups/Logo";
import UserBadge from "../groups/UserBadge";
// context
import { useContext } from "react";
import { UiContext } from "../context/UiContext";

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
  const { selectedGroup } = useContext(UiContext);

  return (
    <main className="h-screen w-screen flex">
      <nav className="bg-gray-800 w-20 flex flex-col overflow-hidden shrink-0">
        <Logo />

        <UserBadge />

        <hr className="m-2 mb-0 mt-0 border-gray-600" />

        <div className="w-full overflow-y-scroll overflow-x-hidden scrollbar-none">
          {DUMMY_DATA.map((group) => {
            let selected = selectedGroup === group.name ? true : false;

            return (
              <GroupBadge
                name={group.name}
                img={group.img}
                selected={selected}
                key={group.id}
              />
            );
          })}

          <NewGroupButton />
        </div>
      </nav>
      <Outlet />
    </main>
  );
}

export default GroupsBar;
