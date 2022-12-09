import { useContext } from "react";

// components
import NewGroupButton from "../groups/NewGroupButton";
import Logo from "../groups/Logo";
import UserBadge from "../groups/UserBadge";
import { SkeletonGroup } from "../ui/SkeletonLoaders";
import { GroupStack } from "../../utils/iterableComponents";

// context
// import { UiContext } from "../context/UiContext";
import { DataContext } from "../context/DataContext";

export default function GroupsBar() {
  // const { group } = useParams();
  const { dataReady } = useContext(DataContext);
  // const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);

  if (!dataReady) {
    return (
      <nav className="bg-gray-800 flex flex-col overflow-hidden shrink-0">
        <Logo className="bg-gray-800" />

        <UserBadge />

        <hr className="m-2 mb-0 mt-0 border-gray-600" />

        <div className="w-full overflow-y-scroll overflow-x-hidden scrollbar-none">
          <SkeletonGroup />
          <SkeletonGroup />
          <SkeletonGroup />

          <NewGroupButton />
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="bg-gray-800 w-20 flex flex-col overflow-hidden flex-shrink-0">
        <Logo />

        <UserBadge />

        <hr className="m-2 mb-0 mt-0 border-gray-600" />

        <div className="w-full overflow-y-scroll overflow-x-hidden scrollbar-none">
          <GroupStack />
          <NewGroupButton />
        </div>
      </nav>
    );
  }
}
