import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import InputBox from "../components/ui/InputBox";
import { DataContext } from "../components/context/DataContext";
import { UiContext } from "../components/context/UiContext";

import CircleButton from "../components/ui/CircleButton";

const axiosConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

function LoginPage() {
  const navigate = useNavigate();
  // const { userData, setUserData } = useContext(DataContext);
  const { setGroupMounted, setIsLoggedIn } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const [formState, setFormState] = useState("login");
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  function submitHandler(e) {
    e.preventDefault();
    const axiosUser = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });

    let userData = new FormData();
    userData.append("username", usernameRef.current.value);
    userData.append("password", passwordRef.current.value);

    let route = formState === "login" ? "/u/login" : "/u";

    axiosUser
      .post(route, userData, axiosConfig)
      .then((res) => {
        // setUserData(res.data);
        console.log("success:", res);
        // console.log(userData);

        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        setIsLoggedIn(true);

        localStorage.setItem("username", res.data.username);
        localStorage.setItem("userImage", res.data.userImage);
        localStorage.setItem("userImageSmall", res.data.userImageSmall);
        localStorage.setItem("userImageMedium", res.data.userImageMedium);
      })
      .catch((err) => console.log("error:", err))
      .then(() => {
        navigate("/");
      });
  }

  function switchForm() {
    if (formState === "login") {
      setFormState("register");
    } else {
      setFormState("login");
    }
  }

  return (
    <div className="bgHeroDiagDark text-gray-400 w-full h-full flex items-center justify-evenly ">
      <div
        className={
          "text-3xl text-mexican-red-600 font-montserrat font-semibold"
        }
      >
        MERCURY
      </div>

      <form
        className="w-3/5 max-w-md h-1/3 max-h-64 bg-gray-800 rounded-xl flex justify-center items-center"
        onSubmit={submitHandler}
      >
        <div className="w-3/4 flex flex-col items-center">
          <label htmlFor="username" className=" sr-only">
            username
          </label>
          <InputBox className="bg-gray-700 w-5/6 m-3">
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              className="block bg-gray-700 w-full focus:outline-none"
              autoComplete="off"
              ref={usernameRef}
            />
          </InputBox>
          <label htmlFor="password" className=" sr-only">
            password
          </label>
          <InputBox className="bg-gray-700 w-5/6 m-3">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              className="block bg-gray-700 w-full focus:outline-none"
              autoComplete="off"
              ref={passwordRef}
            />
          </InputBox>
          {formState === "login" ? (
            ""
          ) : (
            <InputBox className="bg-gray-700 w-5/6 m-3">
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                placeholder="Confirm password"
                className="block bg-gray-700 w-full focus:outline-none"
                autoComplete="off"
              />
            </InputBox>
          )}
          <p className="block hover:cursor-pointer" onClick={switchForm}>
            {formState === "login" ? "Register" : "Login"}
          </p>
        </div>

        <CircleButton status="error" />

        {/* <button className="block">
          {formState === "login" ? "Login" : "Register"}
        </button> */}
      </form>
    </div>
  );
}

export default LoginPage;
