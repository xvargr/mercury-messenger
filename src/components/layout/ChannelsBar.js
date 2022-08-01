import { useParams } from "react-router-dom";
import { useEffect } from "react";
// components
import Channels from "../channels/ChannelBadge";
import NewChannelButton from "../channels/NewChannelButton";
import GroupBanner from "../channels/GroupBanner";
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

function ChannelsBar() {
  const { group, channel } = useParams();
  const { selectedChannel, setSelectedChannel, setSelectedGroup } =
    useContext(UiContext);

  useEffect(() => {
    if (channel !== undefined && channel !== selectedChannel) {
      setSelectedChannel(channel);
    } else if (channel === undefined && selectedChannel !== null) {
      setSelectedChannel(null);
    }
    setSelectedGroup(group);
  });

  const groupIndex = DUMMY_DATA.findIndex((data) => {
    return data.name === group;
  });

  return (
    <section className="bg-gray-700 h-screen w-1/4 shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
      <GroupBanner name={group} />
      <div className="w-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center">
        <div className="w-1/3 mb-2 mt-2"></div>
        {DUMMY_DATA[groupIndex].channels.map((channel) => {
          let selected = selectedChannel === channel.name ? true : false;

          return (
            <Channels
              name={channel.name}
              selected={selected}
              key={channel.name}
            />
          );
        })}

        <NewChannelButton />
        <hr className="w-1/3 mb-2 mt-2 border-gray-800" />
      </div>
    </section>
  );
}

export default ChannelsBar;
