import { useState, useEffect, useRef } from "react";
// import ui
import CardFloat from "../ui/CardFloat";
import CircleButton from "../ui/CircleButton";

function NewGroupForm(props) {
  const [inpErr, setInpErr] = useState(true);
  const [feedback, setFeedback] = useState("Enter invite code");
  const [buttonStatus, setButtonStatus] = useState("error");
  const inpRef = useRef();

  useEffect(() => {
    if (props.err.message && feedback !== props.err.message) {
      setFeedback(props.err.message);
      setButtonStatus("error");
      setInpErr(true);

      inpRef.current.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.err]);

  function onChangeHandler(e) {
    const idRegex = /\/g\/[a-f\d]{24}\/join/;
    if (idRegex.test(e.target.value)) {
      setButtonStatus("ok");
      setInpErr(false);
    } else {
      setButtonStatus("error");
      setInpErr(true);
    }
  }

  function submitHandler(e) {
    e.preventDefault();
    if (!inpErr) {
      setButtonStatus("submitted");
      props.onJoinGroup(inpRef.current.value);
    }
  }

  return (
    <CardFloat className="w-3/4 max-w-2xl -mt-16">
      <form
        className="flex justify-between items-center"
        onSubmit={submitHandler}
      >
        <label
          className="text-lg font-medium text-gray-900 dark:text-gray-400 sr-only"
          htmlFor="link"
        >
          Join by invite code
        </label>
        <input
          type="text"
          name="link"
          id="link"
          placeholder={feedback}
          autoComplete="off"
          className="bg-gray-700 p-2 m-1 w-10/12 rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-gray-500 hover:file:cursor-pointer hover:file:opacity-80 hover:bg-gray-600 transition-colors duration-75 ease-in outline-none"
          onChange={onChangeHandler}
          required
          ref={inpRef}
        />
        <CircleButton status={buttonStatus}></CircleButton>
      </form>
    </CardFloat>
  );
}

export default NewGroupForm;
