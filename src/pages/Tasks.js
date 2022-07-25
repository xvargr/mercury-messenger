import { Outlet } from "react-router-dom";
function Tasks() {
  return (
    <div className="bg-slate-600 h-screen flex-grow">
      <h2>All tasks</h2>
      <Outlet />
    </div>
  );
}

export default Tasks;
