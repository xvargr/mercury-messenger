import React from "react";

const HomeWindow = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="h-3/4 w-3/4 p-2 bg-gray-700 rounded-lg shadow-xl overflow-y-auto">
        <h1 className="text-mexican-red-700 text-4xl">TODOS:</h1>
        <ul className="list-disc ml-8">
          <li>mobile ui optimization</li>
        </ul>
      </div>
    </div>
  );
};

export default HomeWindow;
