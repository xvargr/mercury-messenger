import React from "react";

export default function TextButton(props) {
  let bgLight;
  let bgDark;
  let bgDisabled;

  switch (props.color) {
    case "gray-600":
      bgLight = "bg-gray-500";
      bgDark = "bg-gray-600";
      bgDisabled = "opacity-70";
      break;

    default:
      bgLight = "bg-gray-500";
      bgDark = "bg-gray-600";
      bgDisabled = "opacity-50";
      break;
  }

  if (props.disabled) {
    return (
      <button
        className={`py-2 px-4 text-gray-900 font-semibold rounded-full shadow-lg transition-colors duration-150 ${bgDark} ${bgDisabled} ${props.className}`}
        disabled
      >
        {props.text}
      </button>
    );
  } else {
    return (
      <button
        className={`py-2 px-4 text-gray-900 font-semibold rounded-full shadow-lg transition-colors duration-150 ${bgDark} hover:${bgLight} ${props.className}`}
      >
        {props.text}
      </button>
    );
  }
}
