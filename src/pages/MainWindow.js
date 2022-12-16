import { React, useContext, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

// components
import GroupsBar from "../components/layout/GroupsBar";
import { FlashStack } from "../utils/iterableComponents";

// ui
import { ReconnectingModal } from "../components/ui/Modal";

// context
import { DataContext } from "../components/context/DataContext";
import { SocketContext } from "../components/context/SocketContext";

// utility
import useStateRestore from "../utils/restoreState";

function MainWindow() {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(DataContext);

  useStateRestore();

  // redirect to login if not logged in
  useEffect(() => {
    if (!localStorage.username) navigate("/login");
    else if (socket && !isLoggedIn) navigate("/login");
    else setIsLoggedIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <main className="w-screen h-screen font-nunito overflow-hidden flex justify-center bgHeroTopo">
      <ReconnectingModal />
      <FlashStack />
      <GroupsBar />
      <Outlet />
    </main>
  );
}

export default MainWindow;
