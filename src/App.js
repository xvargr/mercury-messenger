import { Routes, Route, Outlet } from "react-router-dom"; // the route component define urls we want to listen to

// importing all pages
import MainWindow from "./pages/MainWindow";
import NewGroupPage from "./pages/NewGroupPage";
import NewChannelPage from "./pages/NewChannelPage";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";
import GroupSettingsPage from "./pages/GroupSettings";
import PageNotFound from "./pages/PageNotFound";

// import components
import ChatWindow from "./components/layout/ChatWindow";
import ChannelsBar from "./components/layout/ChannelsBar";
import HomeWindow from "./components/layout/HomeWindow";
import ChannelIndex from "./components/layout/ChannelIndex";

// import context
import { UiStateProvider } from "./components/context/UiContext";
import { DataStateProvider } from "./components/context/DataContext";
import { FlashStateProvider } from "./components/context/FlashContext";
import { SocketStateProvider } from "./components/context/SocketContext";

function App() {
  return (
    <main className="flex justify-center h-screen w-screen">
      <DataStateProvider>
        <FlashStateProvider>
          <UiStateProvider>
            <SocketStateProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<MainWindow />}>
                  <Route index element={<HomeWindow />} />
                  <Route path="u" element={<UserPage />} />
                  <Route path="g">
                    <Route path="new" element={<NewGroupPage />} />
                    <Route
                      path=":group"
                      element={
                        <>
                          <ChannelsBar />
                          <Outlet />
                        </>
                      }
                    >
                      <Route index element={<ChannelIndex />} />
                      <Route
                        path="settings"
                        element={<GroupSettingsPage />}
                      />{" "}
                      !
                      <Route path="c">
                        <Route path="new" element={<NewChannelPage />} />
                        <Route path=":channel" element={<ChatWindow />} />
                      </Route>
                    </Route>
                  </Route>
                  <Route path="404" element={<PageNotFound />} />
                  <Route path="*" element={<PageNotFound />} />
                </Route>
              </Routes>
            </SocketStateProvider>
          </UiStateProvider>
        </FlashStateProvider>
      </DataStateProvider>
    </main>
  );
}

export default App;
