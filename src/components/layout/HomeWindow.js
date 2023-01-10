import React from "react";

const HomeWindow = () => {
  return (
    // h-full (100%) here causes unexpected behavior on mobile
    <div className="flex grow items-center justify-center">
      {/* <div className="h-full w-full md:h-3/4 md:w-3/4 p-2 bg-gray-700 md:rounded-lg shadow-xl overflow-y-auto scrollbar-dark">
        <h1 className="text-mexican-red-700 text-4xl capitalize">MERCURY</h1>
        <h2 className="text-gray-900 text-2xl capitalize"></h2>
        <ul className="list-disc ml-8">
        <li></li>
      </ul>
      </div> */}
      <div className="text-3xl text-gray-400 font-montserrat font-semibold">
        MERCURY<span className="text-mexican-red-500 text-4xl">.</span>
      </div>
    </div>
  );
};

export default HomeWindow;
