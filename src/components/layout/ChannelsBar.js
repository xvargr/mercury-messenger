import { useParams } from "react-router-dom";

import Channels from "../groups/Channels";

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

function ChannelsBar() {
  const { group } = useParams();

  const groupIndex = DUMMY_DATA.findIndex((data) => {
    return data.name === group;
  });

  return (
    <div className="bg-slate-700 h-screen p-2 w-1/4 overflow-y-auto overflow-x-hidden scrollbar-dark flex flex-col">
      <div>In {group}</div>

      {DUMMY_DATA[groupIndex].channels.map((channel) => {
        return <Channels name={channel.name} key={channel.name} />;
      })}
    </div>
  );
}

export default ChannelsBar;
