import { useEffect, useRef, useState } from "react";

import { XIcon, CheckIcon } from "@heroicons/react/outline";
import InputBox from "./InputBox";
import Dots from "../ui/Dots";

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
      <div className="bg-gray-800 w-1/2 max-w-2xl h-1/3 max-h-60 rounded-lg relative">
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
  const { isReconnecting } = params;
  const [transform, setTransform] = useState("-translate-y-12");
  const [opacity, setOpacity] = useState("-translate-y-12");

  useEffect(() => {
    if (isReconnecting) {
      setTimeout(() => {
        setTransform("translate-y-0");
        setOpacity("opacity-40");
      }, 75);
    } else {
      setTimeout(() => {
        setTransform("-translate-y-12");
        setOpacity("opacity-0 pointer-events-none");
      }, 75);
    }
  }, [isReconnecting]);

  return (
    <>
      <div
        className={`absolute justify-self-center justify-around font-bold bg-gray-500 text-gray-900 h-12 w-2/5 max-w-2xl p-1 rounded-b-md shadow-md transition-transform ease-out transform ${transform} z-50`}
      >
        <span className="h-full w-full flex justify-center items-center">
          reconnecting
          {/* {console.log(socketIsConnected)} */}
          {/* {console.log(socket)} */}
          {/* {socket.disconnect()} */}
          <Dots className="flex w-10 justify-around items-center p-0.5 fill-gray-700" />
        </span>
      </div>
      <div
        className={`w-full h-full bg-black absolute ${opacity} transition-opacity duration-300 ease-in-out z-40`}
      ></div>
    </>
  );
}

export function ConfirmChangesModal(props) {
  const { show, onAccept, onReject, pending } = props;

  return (
    <div
      className={`absolute ${
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
