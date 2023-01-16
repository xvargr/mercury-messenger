import React from "react";

const HomeWindow = () => {
  return (
    // h-full (100%) here causes unexpected behavior on mobile
    <div className="flex grow items-center justify-center">
      <div className="text-3xl text-gray-400 font-montserrat font-semibold">
        MERCURY<span className="text-mexican-red-500 text-4xl">.</span>
      </div>
    </div>
  );
};

export default HomeWindow;
