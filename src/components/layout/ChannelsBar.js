import { useContext } from "react";
import { useParams } from "react-router-dom";

// components
import NewChannelButton from "../channels/NewChannelButton";
import GroupBanner from "../channels/GroupBanner";

// context
import { UiContext } from "../context/UiContext";
import { DataContext } from "../context/DataContext";
import { SkeletonChannel } from "../ui/SkeletonLoaders";
import { ChannelStack, MemberStack } from "../../utils/iterableComponents";

function ChannelsBar() {
  const { group } = useParams();
  const { dataReady } = useContext(DataContext);
  const { selectedGroup, isAdmin } = useContext(UiContext);

  if (!dataReady || !selectedGroup) {
    return (
      <section className="bg-gray-700 h-screen w-1/4 lg:w-1/5 max-w-sm min-w-[10rem] md:min-w-[15rem] flex-shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
        <GroupBanner name={group} />
        <div className="w-full h-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center">
          <div className="w-1/3 mb-2 mt-2"></div>
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
          <SkeletonChannel />
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-gray-700 h-screen w-1/4 lg:w-1/5 max-w-sm min-w-[10rem] md:min-w-[15rem] flex-shrink-0 overflow-hidden scrollbar-dark flex flex-col items-center">
        <GroupBanner name={selectedGroup.name} />
        <div className="w-full h-full flex-grow overflow-y-scroll scrollbar-none flex flex-col items-center justify-between">
          <div className="w-full max-h-[50%] grow flex flex-col items-center overflow-y-auto overflow-x-hidden scrollbar-dark">
            <div className="mt-4"></div>

            <ChannelStack />

            <div className="w-full pt-1 bg-gray-700 flex flex-col items-center sticky-reverse">
              {isAdmin() ? <NewChannelButton for={selectedGroup} /> : null}
            </div>
          </div>

          <hr className="w-1/3 mb-2 mt-2 border-gray-800" />

          <div className="w-full h-1/2 py-1 flex flex-col items-center overflow-y-auto overflow-x-hidden scrollbar-dark">
            <MemberStack />
          </div>
        </div>
      </section>
    );
  }
}

export default ChannelsBar;
