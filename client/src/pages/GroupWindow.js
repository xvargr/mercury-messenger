import { Outlet } from "react-router-dom";
import ChannelsBar from "../components/layout/ChannelsBar";

function GroupWindow() {
  return (
    <div className="w-full flex">
      <ChannelsBar />
      <Outlet />
    </div>
  );
}

export default GroupWindow;
