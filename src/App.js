// this is a react component, it is a function that returns jsx, but otherwise
// is a normal js function
//
// you can use normal html elements in react components or other
// custom components and elements

import { Routes, Route } from "react-router-dom"; // the route component define urls we want to listen to
// link changes the path without reloading  the page

// importing all pages
import GroupWindow from "./pages/GroupPage";
import NewGroupPage from "./pages/NewGroupPage";
import NewChannelPage from "./pages/NewChannelPage";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";

// import components
import GroupsBar from "./components/layout/GroupsBar";
import ChatWindow from "./components/layout/ChatWindow";

function App() {
  return (
    // nested routes' component will always be rendered in the parent component
    <div className="flex">
      <GroupsBar />
      {/* Route constructs the paths and choses which to render , no / before 
        path means that the path is relative*/}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/u" element={<UserPage />} />
        <Route path="/g">
          <Route path="new" element={<NewGroupPage />} />
          <Route path=":group" element={<GroupWindow />}>
            <Route path="c">
              <Route path="new" element={<NewChannelPage />} />
              <Route path=":channel" element={<ChatWindow />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </div>
  );
}

export default App;
