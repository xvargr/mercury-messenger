import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-mexican-red-600">
      <span className="font-montserrat text-3xl text-slate-200">MERCURY</span>

      <Link className="text-slate-200 m-2" to="/">
        Home
      </Link>
      <Link className="text-slate-200 m-2" to="/tasks">
        Tasks
      </Link>
      <Link className="text-slate-200 m-2" to="/chats">
        Chats
      </Link>
    </nav>
  );
}

export default Navbar;
