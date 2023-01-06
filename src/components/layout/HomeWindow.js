import React from "react";

const HomeWindow = () => {
  return (
    // h-full (100%) here causes unexpected behavior on mobile
    <div className="flex grow items-center justify-center">
      <div className="h-full w-full md:h-3/4 md:w-3/4 p-2 bg-gray-700 md:rounded-lg shadow-xl overflow-y-auto scrollbar-dark">
        <h1 className="text-mexican-red-700 text-4xl">TODOS:</h1>
        <ul className="list-disc ml-8">
          <li>mobile ui optimization</li>
          <li>view height when virtual keyboard is activated</li>
          <li>new ch/grp page</li>
          <li>settings, user, group page</li>
        </ul>
      </div>
    </div>
  );
};

export default HomeWindow;
