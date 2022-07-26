// this is a react component, it is a function that returns jsx, but otherwise
// is a normal js function
//
// you can use normal html elements in react components or other
// custom components and elements

import { Routes, Route } from "react-router-dom"; // the route component define urls we want to listen to
// link changes the path without reloading  the page

// importing all pages
// import Tasks from "./pages/Tasks";
// import NewTask from "./pages/NewTask";
// import EditTask from "./pages/EditTask";
import GroupWindow from "./pages/GroupWindow";

import GroupsBar from "./components/GroupsBar";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    // nested routes' component will always be rendered in the parent component
    <div className="flex">
      <GroupsBar />
      {/* Route constructs the paths and choses which to render , no / before 
        path means that the path is relative*/}
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/tasks" element={<Tasks />}>
          <Route path="new" element={<NewTask />} />
          <Route path="edit" element={<EditTask />} />
        </Route> */}
        <Route path="/chats">
          <Route path=":group" element={<GroupWindow />}>
            <Route path=":chanel" element={<ChatWindow />} />
          </Route>
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </div>
  );
}

export default App;
