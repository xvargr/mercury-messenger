import { useParams } from "react-router-dom";
import { useState } from "react";

import Channels from "../ui/groups/Channels";
import NewChannelButton from "../ui/groups/NewChannelButton";

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

function ChannelsBar() {
  const { group, channel } = useParams();
  const [selected, setSelected] = useState(null);

  if (channel !== undefined && channel !== selected) {
    setSelected(channel);
  } else if (channel === undefined && selected !== null) {
    setSelected(null);
  }

  const groupIndex = DUMMY_DATA.findIndex((data) => {
    return data.name === group;
  });

  return (
    <div className="bg-slate-700 h-screen w-1/4 overflow-hidden scrollbar-dark flex flex-col items-center">
      <div className="w-full h-10 bg-slate-800 flex justify-center items-center">
        <div className="m-2">In {group}</div>
      </div>
      <div className="w-12 bg-slate-800 rounded-b-lg fixed top-10 flex justify-center items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <div className="w-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center">
        <div className="w-1/3 mb-2 mt-2"></div>

        {DUMMY_DATA[groupIndex].channels.map((channel) => {
          if (selected === channel.name) {
            return (
              <div
                className="bg-slate-600 w-5/6 m-1 rounded-lg flex"
                key={channel.name}
              >
                <Channels name={channel.name} />
              </div>
            );
          } else {
            return (
              <div
                className="hover:bg-slate-600 w-5/6 m-1 rounded-lg flex"
                key={channel.name}
              >
                <Channels name={channel.name} />
              </div>
            );
          }
        })}
        <NewChannelButton />
        <hr className="w-1/3 mb-2 mt-2 border-slate-800" />
      </div>
    </div>
  );
}

export default ChannelsBar;
