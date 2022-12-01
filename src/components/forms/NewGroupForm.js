import { useState, useEffect } from "react";
// import ui
import CardFloat from "../ui/CardFloat";
import CircleButton from "../ui/CircleButton";
// global vars
let groupNameInput;
let groupImageInput;

function NewGroupForm(props) {
  const [inpErr, setInpErr] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [buttonStatus, setButtonStatus] = useState("error");

  useEffect(() => {
    if (props.err.message && feedback !== props.err.message) {
      setFeedback(props.err.message);
      setButtonStatus("error");
      setInpErr(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.err]);

  useEffect(() => {
    groupNameInput = null;
    groupImageInput = null;
  }, []);

  function onChangeHandler(e) {
    if (e.target.type === "text") {
      groupNameInput = e.target.value;
    } else if (e.target.type === "file") {
      groupImageInput = e.target.files[0];
    }

    function giveError(feedback) {
      setInpErr(true);
      setButtonStatus("error");
      setFeedback(feedback);
    }

    if (!groupNameInput) {
      giveError("A name is required");
    } else if (/[^\w\d ]+/.test(groupNameInput)) {
      giveError("Name cannot contain special characters");
    } else if (groupNameInput.length < 3) {
      giveError("Name must be at least 3 characters");
    } else if (groupNameInput.length > 20) {
      giveError("Name must not be more than 20 characters");
    } else if (!groupImageInput) {
      giveError("An image is required");
    } else if (groupImageInput.size > 3145728) {
      giveError("Image exceeds 3MB");
    } else {
      setInpErr(false);
      setFeedback("Looks good");
      setButtonStatus("ok");
    }
  }

  function submitHandler(e) {
    e.preventDefault();
    if (!inpErr) {
      setButtonStatus("submitted");
      setFeedback("Uploading...");
      const newGroup = {
        name: groupNameInput,
        image: groupImageInput,
      };
      props.onNewGroup(newGroup); // run passed func on parent
    }
  }

  return (
    <CardFloat className="w-3/4 max-w-2xl">
      <div className="text-mexican-red-600 mb-2 font-montserrat font-semibold">
        New Group
      </div>
      <form className="flex flex-col" onSubmit={submitHandler}>
        <label className="mb-2 text-lg font-medium text-gray-400">
          Group Name
          <input
            type="text"
            name="group[name]"
            placeholder="..."
            autoComplete="off"
            className="bg-gray-700 p-2 m-1 w-full rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-gray-500 hover:file:cursor-pointer hover:file:opacity-80 hover:bg-gray-600 transition-colors duration-75 ease-in outline-none"
            required
            onChange={onChangeHandler}
          />
        </label>
        <label className="mb-2 mt-1 text-lg font-medium text-gray-400">
          Image
          <input
            type="file"
            name="group[image]"
            className="bg-gray-700 p-2 m-1 mb-0 w-full rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-gray-500 hover:file:cursor-pointer hover:file:opacity-80 outline-none"
            accept=".jpg, .jpeg, .png, .gif"
            required
            onChange={onChangeHandler}
          />
          <span className="text-sm mt-0 my-1">
            .JPG, .JPEG, or .PNG (max 3MB)
          </span>
        </label>
        <div className="flex justify-end mt-2">
          <div className="h-full p-2 pl-0">{feedback}</div>
          <CircleButton status={buttonStatus}></CircleButton>
        </div>
      </form>
    </CardFloat>
  );
}

export default NewGroupForm;
