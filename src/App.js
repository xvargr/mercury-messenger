import { Routes, Route, Navigate } from "react-router-dom"; // the route component define urls we want to listen to

// importing all pages
import GroupWindow from "./pages/GroupWindow";
import NewGroupPage from "./pages/NewGroupPage";
import NewChannelPage from "./pages/NewChannelPage";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";

// import components
import GroupsBar from "./components/layout/GroupsBar";
import ChatWindow from "./components/layout/ChatWindow";

// import context
import { UiStateProvider } from "./components/context/UiContext";
import { DataStateProvider } from "./components/context/DataContext";

function App() {
  // * temp logged in token
  let loggedIn = true;
  return (
    <DataStateProvider>
      <UiStateProvider>
        <Routes>
          <Route path="/Login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              loggedIn ? <GroupsBar /> : <Navigate to="/login"></Navigate>
            }
          >
            <Route path="u" element={<UserPage />} />
            <Route path="g">
              <Route path="new" element={<NewGroupPage />} />
              <Route path=":group" element={<GroupWindow />}>
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
  );
}

export default App;
