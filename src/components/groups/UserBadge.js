import { Link } from "react-router-dom";

function UserBadge() {
  return (
    <Link to="/u">
      <img
        src={localStorage.userImageSmall}
        className="bg-gray-700 m-2 mt-0 h-16 w-16 object-cover rounded-2xl inline-block hover:rounded-lg transition-all ease-in"
        alt="profile"
      />
    </Link>
  );
}

export default UserBadge;
