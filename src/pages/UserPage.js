import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import { DataContext } from "../components/context/DataContext";

function UserPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(DataContext);

  function logOutHandler() {
    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const axiosUser = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });
    axiosUser
      .delete("/u", axiosConfig)
      .then((res) => {
        localStorage.clear();
        setIsLoggedIn(false);
      })
      .catch((err) => console.log("error:", err))
      .then(() => {
        navigate("/login");
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
