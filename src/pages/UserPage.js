import { useContext, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhotographIcon } from "@heroicons/react/outline";

import axios from "axios";

import { DataContext } from "../components/context/DataContext";
import InputBox from "../components/ui/InputBox";
import CircleButton from "../components/ui/CircleButton";
import TextButton from "../components/ui/TextButton";

const userObject = {
  name: null,
  image: null,
};

function UserPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(DataContext);
  const [inpErr, setInpErr] = useState(true);
  const [buttonText, setButtonText] = useState("Keep changes");
  const [feedback, setFeedback] = useState("");
  const imageRef = useRef();
  const imageInputRef = useRef();

  useEffect(() => {
    imageInputRef.current.value = localStorage.username;
  }, []);

  const axiosConfig = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  const axiosUser = axios.create({
    baseURL: "http://localhost:3100",
    withCredentials: true,
  });

  function logOutUser() {
    axiosUser
      .delete("/u", axiosConfig)
      .then((res) => {
        localStorage.clear();
        setIsLoggedIn(false); // ? clear grp mounted?
        navigate("/login"); // todo restructure so if err, show message and retry
      })
      .catch((err) => console.log("error:", err));
  }

  function deleteUser() {
    console.log("userdelete");
    axiosUser
      .delete(`/u/${localStorage.userId}`, axiosConfig)
      .then((res) => {
        console.log(res);
        // localStorage.clear();
        // setIsLoggedIn(false);
        // navigate("/login");
      })
      .catch((err) => console.log("error:", err));
  }

  function modifyUser(e) {
    e.preventDefault();
    setButtonText("Processing...");
    setInpErr(true);

    let userData = new FormData();
    if (userObject.name) userData.append("name", userObject.name);
    if (userObject.image) userData.append("file", userObject.image);

    axiosUser
      .patch(`/u/${localStorage.userId}`, userData, axiosConfig)
      .then((res) => {
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("userImage", res.data.userImage);
        localStorage.setItem("userImageSmall", res.data.userImageSmall);
        localStorage.setItem("userImageMedium", res.data.userImageMedium);
        navigate("/");
      })
      .catch((err) => {
        setButtonText("Keep changes");
        setInpErr(false);
        setFeedback(err.response.data.message);
      });
  }

  function imagePreview(e) {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        imageRef.current.attributes.src.value = e.target.result;
      };
      fileReader.readAsDataURL(e.target.files[0]);
      userObject.image = e.target.files[0];
    }
    setInpErr(false);
    setButtonText("Keep changes");
  }

  function onUsernameChange(e) {
    userObject.name = e.target.value;
    if (e.target.value.length < 3 || e.target.value.length > 20) {
      setFeedback("username must be 3 to 20 characters");
      setInpErr(true);
    } else {
      setFeedback("");
      setInpErr(false);
    }
    setButtonText("Keep changes");
  }

  return (
    <div className="bg-gray-700 h-full w-full flex flex-col items-center justify-evenly">
      <form
        className="w-4/5 h-4/5 flex flex-col justify-center items-center"
        onSubmit={modifyUser}
      >
        <label htmlFor="userImage" className="group">
          <PhotographIcon className="relative -mt-[6rem] top-[12rem] left-[6rem] text-gray-400 h-[6rem] opacity-0 hover:cursor-pointer group-hover:opacity-100 transition-all duration-100 z-10" />
          <div className="group-hover:brightness-[0.4] group-hover:cursor-pointer transition-all duration-100">
            <img
              src={localStorage.userImage}
              alt="profile"
              className="w-72 h-72 rounded-full"
              ref={imageRef}
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
            className="block w-full bg-gray-600 focus:outline-none text-center font-semibold text-gray-300"
            onChange={onUsernameChange}
            ref={imageInputRef}
            autoComplete="off"
          />
        </InputBox>
        <TextButton className="mt-4" text={buttonText} disabled={inpErr} />
        <div className=" h-4 mt-4 -mb-16 text-mexican-red-500 font-bold">
          {feedback}
        </div>
      </form>

      <CircleButton
        status="logout"
        className="text-mexican-red-400 hover:text-mexican-red-500"
        color="gray-600"
        onClick={logOutUser}
      />
      <div className="text-gray-900 hover:cursor-pointer" onClick={deleteUser}>
        delete acc
      </div>
    </div>
  );
}

export default UserPage;
