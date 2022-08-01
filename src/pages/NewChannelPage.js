// import { useRef } from "react";

// import ui
import CardFloat from "../components/ui/CardFloat";
import InputBox from "../components/ui/InputBox";
import CircleButton from "../components/ui/CircleButton";

import { ArrowRightIcon } from "@heroicons/react/solid";

function NewChannelPage() {
  //! complete this form submit
  function submitHandler(e) {
    e.preventDefault();
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
          <label
            htmlFor="text"
            className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-400"
          >
            Channel name
            <InputBox
              id={"text"}
              type={"text"}
              name={"channel[name]"}
              placeholder={"Name"}
            ></InputBox>
          </label>

          <div className="mt-2">
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-400">
              Channel type
            </h3>
            <ul className="grid gap-6 w-full md:grid-cols-2">
              <li>
                <input
                  type="radio"
                  id="chat"
                  name="type"
                  value="text"
                  className="hidden peer"
                  required
                />
                <label
                  htmlFor="chat"
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
          <div className="flex justify-end mt-3">
            <CircleButton type={"submit"}></CircleButton>
          </div>
        </div>
      </CardFloat>
    </form>
  );
}

export default NewChannelPage;
