// this is a react component, it is a function that returns jsx, but otherwise
// is a normal js function
//
// you can use normal html elements in react components or other
// custom components and elements

import { Routes, Route } from "react-router-dom"; // the route component define urls we want to listen to
// link changes the path without reloading  the page

// importing all pages
import Tasks from "./pages/Tasks";
import NewTask from "./pages/NewTask";
import EditTask from "./pages/EditTask";
import Chats from "./pages/Chat";
import Home from "./pages/Home";

import Navbar from "./components/Navbar";

function App() {
  return (
    // nested routes' component will always be rendered in the parent component
    <div>
      <Navbar />

      {/* Route constructs the paths and choses which to render , no / before 
        path means that the path is relative*/}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />}>
          <Route path="new" element={<NewTask />} />
          <Route path="edit" element={<EditTask />} />
        </Route>
        <Route path="/chats" element={<Chats />} />
      </Routes>
    </div>
  );
}

export default App;
