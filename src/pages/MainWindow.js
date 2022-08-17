import { React, useContext, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import GroupsBar from "../components/layout/GroupsBar";
import { DataContext } from "../components/context/DataContext";

function MainWindow() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(DataContext);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GroupsBar />
      <Outlet />
    </>
  );
}

export default MainWindow;
