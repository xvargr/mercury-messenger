import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function UserPage() {
  const navigate = useNavigate();
  function logOutHandler() {
    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const axiosUser = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true, // ! <= this fixes undefined cookies
    });
    axiosUser
      .delete("/u", axiosConfig)
      .then((res) => console.log("success:", res))
      .catch((err) => console.log("error:", err))
      .then(() => {
        localStorage.clear();
        navigate("/");
      });
  }

  return (
    <div className="bg-gray-700 h-screen w-full">
      <h2>Hello {localStorage.username}!</h2>
      <form>
        <img src={localStorage.userImage} alt="profile" />
        <input type="text" name="" id="" value={localStorage.username} />
      </form>
      <Link to="/login">login page</Link>
      <button onClick={logOutHandler} className="block">
        logOut
      </button>
    </div>
  );
}

export default UserPage;
