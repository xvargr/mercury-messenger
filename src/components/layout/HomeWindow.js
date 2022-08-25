import React from "react";

const HomeWindow = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="h-3/4 w-3/4 p-2 bg-gray-700 rounded-lg shadow-xl">
        <h1 className="text-mexican-red-700 text-4xl">TODOS:</h1>
        <ul className="list-disc ml-8">
          <li>error feedback on actions</li>
          <li>user delete self</li>
          <li>user leave group</li>
          <li>group invite link/code</li>
          <li>group delete</li>
          <li>channel delete</li>
          <li>messages and websockets</li>
          <li>tasks</li>
          <li>
            Check that api is not sending unnecessary info like user hashed pw
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomeWindow;
