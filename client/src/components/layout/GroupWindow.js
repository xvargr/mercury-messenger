import React from "react";
import { Outlet } from "react-router-dom";
import ChannelsBar from "./ChannelsBar";

export default function GroupWindow() {
  return (
    <>
      <ChannelsBar />
      <Outlet />
    </>
  );
}
