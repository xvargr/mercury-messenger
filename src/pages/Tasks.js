import { Outlet } from "react-router-dom";
function Tasks() {
  return (
    <div style={{ padding: "1rem 0" }}>
      <h2>All tasks</h2>
      <Outlet />
    </div>
  );
}

export default Tasks;
