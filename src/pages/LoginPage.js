import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import InputBox from "../components/ui/InputBox";
import { DataContext } from "../components/context/DataContext";
import { UiContext } from "../components/context/UiContext";

import CircleButton from "../components/ui/CircleButton";
// import { ExclamationCircleIcon } from "@heroicons/react/solid";

let userData = {
  username: "",
  password: "",
  passwordCheck: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const [inpErr, setInpErr] = useState(true); // todo
  const [feedback, setFeedback] = useState(""); // todo
  const [buttonStatus, setButtonStatus] = useState("error"); // todo
  const { setGroupMounted, setIsLoggedIn } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const [formState, setFormState] = useState("login");
  // const warnRef = useRef(null);
  useEffect(() => {
    formValidator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  function giveError(feedback) {
    if (feedback) {
      setInpErr(true);
      setButtonStatus("error");
      setFeedback(feedback);
    } else {
      setInpErr(false);
      setButtonStatus("ok");
      setFeedback("Looks good");
    }
  }

  function formValidator() {
    if (formState === "register") {
      if (userData.username.length < 3 || userData.username.length > 20) {
        giveError("username must be 3 to 20 characters long");
      } else if (/[^\w\d ]+/.test(userData.username)) {
        giveError("username must not contain special characters");
      } else if (
        userData.password.length < 8 ||
        userData.password.length > 200
      ) {
        giveError("password must be longer than 8 characters");
      } else if (userData.password !== userData.passwordCheck) {
        giveError("password does not match");
      } else {
        giveError();
      }
    } else {
      if (!userData.username) {
        giveError(" ");
      } else if (!userData.password) {
        giveError(" ");
      } else {
        setFeedback("");
        setInpErr(false);
        setButtonStatus("ok");
      }
    }
  }

  function onChangeHandler(e) {
    if (e.target.id === "username") {
      userData.username = e.target.value;
    } else if (e.target.id === "password") {
      userData.password = e.target.value;
    } else {
      userData.passwordCheck = e.target.value;
    }
    formValidator(); // ! uses old formState so it lags
  }

  function submitHandler(e) {
    e.preventDefault();
    if (!inpErr) {
      let route = formState === "login" ? "/u/login" : "/u";
      setButtonStatus("submitted");

      let formData = new FormData();
      formData.append("username", userData.username);
      formData.append("password", userData.password);

      const axiosConfig = {
        headers: { "Content-Type": "multipart/form-data" },
      };
      const axiosUser = axios.create({
        baseURL: "http://localhost:3100",
        withCredentials: true,
      });
      axiosUser
        .post(route, formData, axiosConfig)
        .then((res) => {
          // console.log("success:", res);
          setSelectedGroup(null);
          setSelectedChannel(null);
          setGroupMounted(false);
          setIsLoggedIn(true);

          localStorage.setItem("username", res.data.userData.username);
          localStorage.setItem("userId", res.data.userData.userId);
          localStorage.setItem("userImage", res.data.userData.userImage);
          localStorage.setItem(
            "userImageSmall",
            res.data.userData.userImageSmall
          );
          localStorage.setItem(
            "userImageMedium",
            res.data.userData.userImageMedium
          );

          navigate("/");
        })
        .catch((err) => {
          // ! api crash if user auth failed

          console.log(err);
          setFeedback(err.response.data.messages[0].message);
          setButtonStatus("ok");
        });
    }
  }

  function switchForm() {
    if (formState === "login") {
      setButtonStatus("error");
      setFormState("register");
    } else {
      setFeedback("");
      setButtonStatus("ok");
      setFormState("login");
    }
    // formValidator(); // ! lags one state change use old val
  }

  return (
    <div className="bgHeroDiagDark text-gray-400 w-full h-full flex flex-col items-center justify-evenly md:flex-row">
      <div className="text-3xl text-gray-red-600 font-montserrat font-semibold">
        MERCURY<span className="text-mexican-red-500 text-4xl">.</span>
      </div>

      <form
        className="w-[70%] h-1/3 max-h-64 bg-gray-800 rounded-xl flex justify-evenly items-center md:w-3/5 md:max-w-md"
        onSubmit={submitHandler}
      >
        <div className="w-3/4 h-full flex flex-col justify-between items-center">
          <div className="h-6 mt-1">{feedback}</div>
          <div className="w-full flex flex-col items-center">
            <label htmlFor="username" className="sr-only">
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
                onChange={onChangeHandler}
              />
            </InputBox>
            <label htmlFor="password" className="sr-only">
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
                maxLength="200"
                onChange={onChangeHandler}
              />
            </InputBox>
            {formState === "login" ? (
              ""
            ) : (
              <InputBox className="bg-gray-700 w-5/6 m-3">
                <input
                  type="password"
                  name="passwordCheck"
                  id="passwordCheck"
                  placeholder="Confirm password"
                  className="block bg-gray-700 w-full focus:outline-none"
                  autoComplete="off"
                  onChange={onChangeHandler}
                />
              </InputBox>
            )}
          </div>
          <div className="hover:cursor-pointer mb-1" onClick={switchForm}>
            {formState === "login" ? "Register" : "Login"}
          </div>
        </div>

        <CircleButton status={buttonStatus} className="mr-6" />
      </form>
    </div>
  );
}

export default LoginPage;
