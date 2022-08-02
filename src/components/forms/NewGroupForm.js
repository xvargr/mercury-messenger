import { useState } from "react";
// import ui
import CardFloat from "../ui/CardFloat";
import CircleButton from "../ui/CircleButton";
// vars
let groupNameInput;
let groupImageInput;

function NewGroupForm() {
  const [inpErr, setInpErr] = useState(true);
  const [feedback, setFeedback] = useState("");

  function onChangeHandler(e) {
    if (e.target.type === "text") {
      groupNameInput = e.target.value;
    } else if (e.target.type === "file") {
      groupImageInput = e.target.value;
    }

    if (!groupNameInput) {
      setInpErr(true);
      setFeedback("A name is required");
    } else if (/[^\w\d ]+/.test(groupNameInput)) {
      setInpErr(true);
      setFeedback("Name cannot contain special characters");
    } else if (groupNameInput.length < 3) {
      setInpErr(true);
      setFeedback("Name must be at least 3 characters long");
    } else if (!groupImageInput) {
      setInpErr(true);
      setFeedback("An image is required");
    } else {
      setInpErr(false);
      setFeedback("Looks good");
    }
  }

  function submitHandler(e) {
    e.preventDefault();
    if (!inpErr) {
      console.log("FORM SUBMITTED");
      const newChannel = {
        name: groupNameInput,
        type: groupImageInput,
      };
      console.log(newChannel);
    }
  }

  return (
    <div className="bg-gray-700 w-full flex justify-center items-center bgHeroDiagDark">
      <CardFloat className="w-3/4 max-w-2xl">
        <div className="text-mexican-red-600 mb-2 font-montserrat font-semibold">
          New Group
        </div>
        <form className="flex flex-col" onSubmit={submitHandler}>
          <label className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-400">
            Group Name
            <input
              type="text"
              name="group[name]"
              placeholder="..."
              autoComplete="off"
              className="bg-gray-700 p-2 m-1 w-full rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-slate-500 hover:file:cursor-pointer hover:file:opacity-80 outline-none"
              required
              onChange={onChangeHandler}
            />
          </label>
          <label className="mb-2 mt-1 text-lg font-medium text-gray-900 dark:text-gray-400">
            Image
            <input
              type="file"
              name="group[image]"
              className="bg-gray-700 p-2 m-1 mb-0 w-full rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-slate-500 hover:file:cursor-pointer hover:file:opacity-80 outline-none"
              accept=".jpg, .jpeg, .png"
              required
              onChange={onChangeHandler}
            />
            <span className="text-sm mt-0 my-1">.JPG, .JPEG, or .PNG</span>
          </label>
          <div className="flex justify-end mt-2">
            <div className="h-full p-2 pl-0">{feedback}</div>
            <CircleButton
              svg={inpErr ? "cross" : "check"}
              disabled={inpErr ? true : false}
            ></CircleButton>
          </div>
        </form>
      </CardFloat>
    </div>
  );
}

export default NewGroupForm;
