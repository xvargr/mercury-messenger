import { useState } from "react";
// import ui
import CardFloat from "../ui/CardFloat";
// import InputBox from "../components/ui/InputBox";
import CircleButton from "../ui/CircleButton";
// SVG
import { ArrowRightIcon } from "@heroicons/react/solid";
// vars
let channelNameInput;
let channelTypeInput;

function NewChannelForm() {
  const [inpErr, setInpErr] = useState(true);
  const [feedback, setFeedback] = useState("");

  function onChangeHandler(e) {
    // console.log(e.target.type);
    if (e.target.type === "text") {
      channelNameInput = e.target.value;
      // console.log("title: ", channelNameInput);
    } else if (e.target.type === "radio") {
      channelTypeInput = e.target.value;
      // console.log("type: ", channelTypeInput);
    }

    if (!channelNameInput) {
      setInpErr(true);
      setFeedback("A name is required");
    } else if (/[^\w\d ]+/.test(channelNameInput)) {
      setInpErr(true);
      setFeedback("Name cannot contain special characters");
    } else if (channelNameInput.length < 3) {
      setInpErr(true);
      setFeedback("Name must be at least 3 characters long");
    } else if (!channelTypeInput) {
      setInpErr(true);
      setFeedback("Select a channel type");
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
        name: channelNameInput,
        type: channelTypeInput,
      };
      console.log(newChannel);
    }
  }

  return (
    <form
      className="bg-gray-700 w-full flex justify-center items-center bgHeroDiagLight"
      onSubmit={submitHandler}
    >
      <CardFloat className="w-3/4 max-w-2xl">
        <div className="text-mexican-red-600 mb-2 font-montserrat font-semibold">
          New Channel
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-400">
            Channel name
            <input
              type="text"
              name="name"
              placeholder="..."
              autoComplete="off"
              className="bg-gray-700 p-2 m-1 w-full rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-slate-500 hover:file:cursor-pointer hover:file:opacity-80 outline-none"
              required
              onChange={onChangeHandler}
            />
          </label>

          <div className="mt-2">
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-400">
              Channel type
            </h3>
            <ul className="grid gap-6 w-full md:grid-cols-2">
              <li>
                <input
                  type="radio"
                  id="type"
                  name="type"
                  value="text"
                  className="hidden peer"
                  onChange={onChangeHandler}
                />
                <label
                  htmlFor="type"
                  className="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="block">
                    <div className="w-full text-lg font-semibold">Text </div>
                    <div className="w-full">Chat and discuss</div>
                  </div>
                  <ArrowRightIcon className="ml-3 w-6 h-6 shrink-0" />
                </label>
              </li>

              <li>
                <input
                  type="radio"
                  id="task"
                  name="type"
                  value="task"
                  className="hidden peer"
                  onChange={onChangeHandler}
                ></input>
                <label
                  htmlFor="task"
                  className="inline-flex justify-between items-center p-5 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="block">
                    <div className="w-full text-lg font-semibold">Tasks </div>
                    <div className="w-full">Collaborate on tasks</div>
                  </div>
                  <ArrowRightIcon className="ml-3 w-6 h-6 shrink-0" />
                </label>
              </li>
            </ul>
          </div>
          <div className="flex justify-end items-center mt-3">
            <div className="h-full p-2 pl-0">{feedback}</div>
            <CircleButton
              svg={inpErr ? "cross" : "check"}
              disabled={inpErr ? true : false}
            ></CircleButton>
          </div>
        </div>
      </CardFloat>
    </form>
  );
}

export default NewChannelForm;
