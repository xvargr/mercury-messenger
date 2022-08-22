import { React, useContext, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import GroupsBar from "../components/layout/GroupsBar";
import { DataContext } from "../components/context/DataContext";

function MainWindow() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(DataContext);

  useEffect(() => {
    if (!isLoggedIn && !localStorage.username) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <>
      <GroupsBar />
      <Outlet />
    </>
  );
}

export default MainWindow;
