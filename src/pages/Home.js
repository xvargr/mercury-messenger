import { Outlet } from "react-router-dom";

function Home() {
  return (
    <div>
      Home
      <Outlet />
      {/* outlet will nest the UI components for shared layout when the child route matches */}
    </div>
  );
}

export default Home;
