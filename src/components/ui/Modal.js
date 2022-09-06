import { useEffect, useRef } from "react";
import { XIcon } from "@heroicons/react/outline";
import InputBox from "./InputBox";

export const DeleteUserModal = (props) => {
  const { toggle, onSubmit, feedback } = props;
  const modalRef = useRef();

  useEffect(() => {
    modalRef.current.focus();
  }, []);

  function sendBack(e) {
    props.sendBack(e.target.value);
  }

  //   console.log(props.feedback);

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
          <InputBox className="w-3/5">
            <input
              type="password"
              name="password"
              id="password"
              onChange={sendBack}
              className="bg-gray-700 font-normal focus:outline-none"
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
};