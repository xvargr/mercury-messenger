import { useEffect, useRef, useState, useContext } from "react";

// context
import { SocketContext } from "../context/SocketContext";

// components
import { XIcon, CheckIcon } from "@heroicons/react/outline";
import InputBox from "./InputBox";
import Dots from "../ui/Dots";
import { DataContext } from "../context/DataContext";

const spinnerSvg = (
  <svg
    className="animate-spin h-6 w-6 text-gray-300"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export function DeleteUserModal(props) {
  const { toggle, onSubmit, feedback } = props;
  const modalRef = useRef();

  useEffect(() => {
    modalRef.current.focus();
  }, []);

  function sendBack(e) {
    props.sendBack(e.target.value);
  }

  return (
    <div
      id="modalBackground"
      tabIndex="-1"
      ref={modalRef}
      onClick={toggle}
      onKeyDown={toggle}
      className="bg-black text-gray-500 absolute w-full h-full bg-opacity-80 flex justify-center items-center z-20"
    >
      <div className="bg-gray-800 w-4/5 md:w-1/2 md:max-w-2xl h-1/3 max-h-60 rounded-lg relative">
        <XIcon
          id="modalCloseButton"
          className="w-6 text-mexican-red-600 hover:text-mexican-red-500 absolute top-0 right-0 m-1 hover:cursor-pointer"
        />
        <form
          className="w-full h-full flex flex-col justify-around items-center"
          onSubmit={onSubmit}
        >
          <label htmlFor="password" className="block font-bold">
            Confirm account deletion
          </label>
          <InputBox className="w-3/5 bg-gray-700 p-4 group hover:bg-gray-600">
            <input
              type="password"
              name="password"
              id="password"
              onChange={sendBack}
              className="w-full text-gray-400 bg-gray-700 group-hover:bg-gray-600 transition-colors ease-in duration-75 font-normal focus:outline-none"
              placeholder="Enter your password..."
            />
          </InputBox>
          <button className="text-gray-400 bg-mexican-red-700 hover:bg-mexican-red-600 hover:cursor-pointer px-5 py-2 rounded-full">
            {feedback ? feedback : "DELETE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ReconnectingModal(params) {
  const [transform, setTransform] = useState("-translate-y-14");
  const [opacity, setOpacity] = useState("opacity-0");

  const { socket } = useContext(SocketContext);
  const { socketError } = useContext(DataContext);

  useEffect(() => {
    if (!socket?.connected) {
      setTimeout(() => {
        setTransform("translate-y-0");
        setOpacity("opacity-40");
      }, 75);
    } else {
      setTimeout(() => {
        setTransform("-translate-y-14");
        setOpacity("opacity-0 pointer-events-none");
      }, 75);
    }
  }, [socket?.connected]);

  return (
    <>
      <div
        onClick={() => {
          if (socketError) window.location.reload(false);
        }}
        className={`
        ${transform} 
        ${socketError ? "cursor-pointer" : null} 
        h-12 w-fit p-6 md:px-8 py-1 absolute justify-self-center justify-around font-bold bg-gray-500 text-gray-900 rounded-b-md shadow-md transition-transform ease-out transform 
        z-50`}
      >
        <span className="h-full w-full flex justify-center items-center p-1">
          {socketError ? socketError : "reconnecting"}
          {socketError ? null : (
            <Dots className="flex w-10 justify-around items-center p-0.5 m-2 fill-gray-700" />
          )}
        </span>
      </div>
      <div
        className={`w-screen h-screen bg-black absolute ${opacity} transition-opacity duration-300 ease-in-out z-40`}
      ></div>
    </>
  );
}

export function ConfirmChangesModal(props) {
  const { show, onAccept, onReject, pending } = props;

  return (
    <div
      className={`absolute left-0 right-0 m-auto ${
        show ? "translate-y-16" : "translate-y-0"
      } -top-4 w-5/6 h-11 bg-gray-500 shadow-md rounded-lg px-4 transition-transform ease-in-out duration-200 flex items-center justify-between z-20`}
    >
      <span>{pending ? "Saving changes..." : "Save changes?"}</span>
      <span className="flex">
        {pending ? (
          <div className="w-16 h-8 bg-green-600 opacity-70 p-1 m-1 rounded-full flex justify-center">
            {spinnerSvg}
          </div>
        ) : (
          <CheckIcon
            className="w-16 h-8 bg-green-600 hover:bg-green-400 text-gray-800 p-1 m-1 rounded-full transition-colors ease-in duration-75 hover:cursor-pointer"
            onClick={onAccept}
          />
        )}
        <XIcon
          className={`w-8 h-8 bg-mexican-red-500 ${
            pending
              ? "opacity-70"
              : "hover:bg-mexican-red-400  transition-colors ease-in duration-75 hover:cursor-pointer"
          } text-gray-800 p-1 m-1 rounded-full`}
          onClick={pending ? null : onReject}
        />
      </span>
    </div>
  );
}

export function ImageExpandedModal(params) {
  const { imgSrc, toggle } = params;

  return (
    <div
      onClick={toggle}
      className="top-0 left-0 w-full h-full bg-black text-gray-500 fixed bg-opacity-70 flex justify-center items-center z-30"
    >
      <img className="max-w-[90%] max-h-[90%]" src={imgSrc} alt="full size" />
    </div>
  );
}

export function IntroductionModal() {
  const [introDone, setIntroDone] = useState(
    localStorage.introduction ? false : true
  );

  function disableIntro() {
    setIntroDone(true);
    localStorage.removeItem("introduction");
  }

  if (!introDone) {
    return (
      <>
        <div
          onClick={(e) => {
            e.nativeEvent.stopPropagation();
            disableIntro();
          }}
          className="top-0 left-0 w-full h-full bg-black fixed bg-opacity-50 z-30"
        ></div>
        <div className="w-11/12 max-w-[70rem] max-h-[95%] h-fit p-3 absolute top-0 bottom-0 left-0 right-0 m-auto bg-gray-700 text-gray-300 rounded-lg shadow-md scrollbar-dark overflow-y-auto overflow-x-hidden z-30">
          <h1 className="text-3xl font-montserrat font-semibold text-mexican-red-500">
            Welcome to Mercury
          </h1>

          <h2 className="font-semibold text-lg mt-3">What is Mercury?</h2>
          <p>
            Mercury is a group messaging application inspired by Discord and
            Slack. This project is created primarily for me to learn React and
            Tailwind, as well as to get some practice with restful APIs and
            databases.
          </p>
          <p className="mt-1">
            Socket.io is used to facilitate messaging between clients and
            communicating behind the scenes events. Some more traditional
            requests uses Axios to communicate with the backend. The database
            for this application is MongoDb, which is a noSQL database while
            images are stored on Cloudinary.
          </p>
          <h2 className="font-semibold text-lg mt-3">Features</h2>
          <ul className="list-disc ml-8">
            <li>Create groups and channels for different discussions</li>
            <li>Group messaging with replies and mentions</li>
            <li>Message image attachments</li>
            <li>Invite, promote, and kick users from group</li>
            <li>Customizable user profiles</li>
          </ul>
          <h2 className="font-semibold text-lg mt-3">Source code and more</h2>
          <p>
            See the source code on{" "}
            <a
              className="text-mexican-red-500 font-semibold hover:underline hover:text-mexican-red-400"
              href="https://github.com/xvargr"
            >
              github
            </a>
            . For more projects and information about me, visit{" "}
            <a
              className="text-mexican-red-500 font-semibold hover:underline hover:text-mexican-red-400"
              href="https://vargr.dev"
            >
              vargr.dev
            </a>
            . For more projects
          </p>
          <div
            onClick={disableIntro}
            className="w-40 sticky bottom-0 left-0 right-0 m-auto sm:mr-0 bg-mexican-red-600 hover:bg-mexican-red-500 p-1 text-center rounded-full mt-8 shadow-md transition-colors cursor-pointer"
          >
            close
          </div>
        </div>
      </>
    );
  } else return null;
}
