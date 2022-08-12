import { Link } from "react-router-dom";

function UserPage() {
  return (
    <div className="bg-gray-700 h-screen w-full">
      UserPage
      <div>user image</div>
      <div>user name</div>
      <Link to="/login">user logout</Link>
    </div>
  );
}

export default UserPage;
