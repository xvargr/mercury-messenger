import { useState, useEffect } from "react";
import {
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XIcon,
} from "@heroicons/react/outline";

export function FlashMessageWrapper(props) {
  return (
    <div className="absolute top-0 right-0 h-full scrollbar-none overflow-y-scroll pointer-events-none">
      {props.children}
    </div>
  );
}

export function FlashMessage(props) {
  const [fadeClass, setFadeClass] = useState("");

  useEffect(() => {
    if (props.position === 0 && fadeClass.length === 0) {
      const selfUnmountTimer = setTimeout(() => {
        setFadeClass("opacity-0 transition-opacity duration-700");
        setTimeout(() => {
          props.unmount(props.position);
          setFadeClass(""); // for some reason the component next in the list will have its fadeClass set if it is not set back to ""
        }, 700);
      }, 3000);
      // clear timeout on umount to prevent duplicate unmount calls, without this component will try to unmount multiple times
      return () => clearTimeout(selfUnmountTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  function unmountThis() {
    setFadeClass("opacity-0 transition-opacity duration-700");
    const requestedUnmountTimer = setTimeout(() => {
      props.unmount(props.position);
      setFadeClass(""); // for some reason the component next in the list will have its fadeClass set if it is not set back to ""
    }, 700);
    // clear timeout on umount to prevent duplicate unmount calls, without this component will try to unmount multiple times
    return () => clearTimeout(requestedUnmountTimer);
  }

  let charm;
  const message = props.message ? props.message : props.type;
  switch (props.type) {
    case "alert":
      charm = (
        <div className="bg-amber-500 rounded-l-xl flex justify-center">
          <InformationCircleIcon className="w-6 m-1 text-gray-600 shrink-0" />
        </div>
      );

      break;
    case "success":
      charm = (
        <div className="bg-green-600 rounded-l-xl flex justify-center">
          <CheckCircleIcon className="w-6 m-1 text-gray-600 shrink-0" />
        </div>
      );

      break;
    case "error":
      charm = (
        <div className="bg-red-500 rounded-l-xl flex justify-center">
          <ExclamationCircleIcon className="w-6 m-1 text-gray-600 shrink-0" />
        </div>
      );

      break;
    default:
      charm = null;
      break;
  }

  return (
    <div
      className={`relative m-2 pr-6 w-96 min-h-[3rem] h-fit rounded-xl backdrop-blur-sm flex shadow-md z-50 ${fadeClass}`}
    >
      <div className="w-full h-full absolute -z-10 rounded-xl bg-gray-500 opacity-70"></div>
      <XIcon
        className="w-6 absolute top-0 right-0 p-1 text-gray-800 bg-mexican-red-500 hover:bg-mexican-red-400 hover:cursor-pointer rounded-tr-xl rounded-bl-md pointer-events-auto"
        onClick={unmountThis}
      />
      {charm}
      <p className="text-gray-900 ml-2 self-center">{message}</p>
    </div>
  );
}
