import { useState, useRef } from "react";
import axios from "axios";

import InputBox from "../components/ui/InputBox";
// import Logo from "../components/groups/Logo";

function LoginPage() {
  const [formState, setFormState] = useState("login");
  const usernameRef = useRef(null);
  const passwordRef = useRef(null); // ! can use same ref for log and reg

  function submitHandler(e) {
    e.preventDefault();
    if (formState === "login") {
      console.log("loginSubmit");
      console.log(usernameRef.current.value);
      console.log(passwordRef.current.value);
    } else {
      console.log("registerSubmit");
      console.log(usernameRef.current.value);
      console.log(passwordRef.current.value);
    }
  }

  function switchForm() {
    if (formState === "login") {
      setFormState("register");
    } else {
      setFormState("login");
    }
  }

  return (
    <div className="bg-gray-800 text-gray-400 w-full h-full flex items-center justify-evenly">
      <div>MERCURY</div>

      <div className="w-3/5 max-w-md h-1/3 max-h-64 bg-gray-700 rounded-xl flex flex-col justify-center items-center">
        <form
          className="w-full flex flex-col items-center"
          onSubmit={submitHandler}
        >
          <label htmlFor="username" className=" sr-only">
            username
          </label>
          <InputBox className="bg-gray-500 w-4/6 m-3">
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              className="block bg-gray-500 w-full focus:outline-none"
              autoComplete="off"
              ref={usernameRef}
            />
          </InputBox>
          <label htmlFor="password" className=" sr-only">
            password
          </label>
          <InputBox className="bg-gray-500 w-4/6 m-3">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              className="block bg-gray-500 w-full focus:outline-none"
              autoComplete="off"
              ref={passwordRef}
            />
          </InputBox>
          <button className="block">
            {formState === "login" ? "Login" : "Register"}
          </button>
        </form>

        <button className="block" onClick={switchForm}>
          {formState === "login" ? "Register" : "Login"}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
