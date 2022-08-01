import { Link } from "react-router-dom";

function UserBadge() {
  return (
    <Link
      to="/u"
      className="bg-gray-700 m-2 mt-0 p-4 h-16 rounded-2xl inline-block hover:rounded-lg transition-all ease-in"
    ></Link>
  );
}

export default UserBadge;
