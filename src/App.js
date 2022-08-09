import { Routes, Route, Navigate, Outlet } from "react-router-dom"; // the route component define urls we want to listen to

// importing all pages
// import GroupWindow from "./pages/GroupWindow";
import NewGroupPage from "./pages/NewGroupPage";
import NewChannelPage from "./pages/NewChannelPage";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";

// import components
import GroupsBar from "./components/layout/GroupsBar";
import ChatWindow from "./components/layout/ChatWindow";
import ChannelsBar from "./components/layout/ChannelsBar";

// import context
import { UiStateProvider } from "./components/context/UiContext";
import { DataStateProvider } from "./components/context/DataContext";
import HomeWindow from "./components/layout/HomeWindow";

// ! Router needs rework (again)
// ? https://reactrouter.com/docs/en/v6/getting-started/tutorial

function App() {
  // * temp logged in token
  let loggedIn = true;
  // let loggedIn = false;
  return (
    <main className="flex h-screen w-screen">
      <DataStateProvider>
        <UiStateProvider>
          {/* <Routes>
            <Route path="/" element={}></Route>
          </Routes> */}
          <Routes>
            <Route path="/Login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                loggedIn ? (
                  <>
                    <GroupsBar /> <Outlet />
                  </>
                ) : (
                  <Navigate to="/login" />
                )
              }
              // element={
              //   loggedIn ? <GroupsBar /> : <Navigate to="/login"></Navigate>
              // }
            >
              <Route index element={<HomeWindow />}></Route>
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
                  <Route index element={"Channel index"} />
                  <Route path="c">
                    <Route path="new" element={<NewChannelPage />} />
                    <Route path=":channel" element={<ChatWindow />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<div>404</div>} />
            </Route>
          </Routes>
        </UiStateProvider>
      </DataStateProvider>
    </main>
  );
}

export default App;
