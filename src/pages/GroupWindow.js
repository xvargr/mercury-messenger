import { Outlet } from "react-router-dom";
import ChannelsBar from "../components/ChannelsBar";

function GroupWindow() {
  return (
    <div className="flex-grow flex">
      <ChannelsBar />
      <Outlet />
      {/* should output chat window */}
    </div>
  );
}

export default GroupWindow;