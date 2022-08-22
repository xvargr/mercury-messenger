import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PhotographIcon } from "@heroicons/react/outline";

import axios from "axios";

import { DataContext } from "../components/context/DataContext";
import InputBox from "../components/ui/InputBox";
import CircleButton from "../components/ui/CircleButton";

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
        navigate("/login"); // todo restructure so if err, show message and retry
      })
      .catch((err) => console.log("error:", err));
  }

  // todo file preview
  function imagePreview(e) {
    // console.log(e.target.files[0]);
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        console.log("hello"); // * works 😃
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  }

  function nameOnChange(e) {
    console.log(e.target);
  }

  return (
    <div className="bg-gray-700 h-full w-full flex flex-col items-center justify-evenly">
      <form className="w-4/5 h-4/5 flex flex-col justify-center items-center">
        <label htmlFor="userImage" className="group">
          <PhotographIcon className="relative -mt-[6rem] top-[12rem] left-[6rem] text-gray-400 h-[6rem] opacity-0 hover:cursor-pointer group-hover:opacity-100 transition-all duration-100 z-10" />
          <div className="group-hover:brightness-[0.4] group-hover:cursor-pointer transition-all duration-100">
            <img
              src={localStorage.userImage}
              alt="profile"
              className="w-72 h-72 rounded-full"
            />
          </div>
        </label>
        <input
          type="file"
          name="userImage"
          id="userImage"
          className="sr-only"
          accept=".jpg, .jpeg, .png, .gif"
          onChange={imagePreview}
        />
        <label htmlFor="username" className="sr-only">
          username
        </label>
        <InputBox className="w-60 mt-4 bg-gray-600">
          <input
            type="text"
            name="username"
            id="username"
            value={localStorage.username}
            className="block w-full bg-gray-600 focus:outline-none text-center font-semibold text-gray-300"
            onChange={nameOnChange}
          />
        </InputBox>
        <button className="mt-4 bg-gray-600 text-gray-900 font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-500 transition-colors duration-150">
          keep changes
        </button>
      </form>

      <CircleButton
        status="logout"
        className="bg-gray-600 text-mexican-red-400 hover:bg-gray-500 hover:text-mexican-red-500"
        onClick={logOutHandler}
      />
      <div className="text-gray-900">delete acc</div>
    </div>
  );
}

export default UserPage;
