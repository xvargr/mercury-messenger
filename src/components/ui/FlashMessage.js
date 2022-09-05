import { useEffect, useState, useRef } from "react";
import {
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XIcon,
} from "@heroicons/react/outline";

export function FlashMessageWrapper(props) {
  return (
    <div className="absolute top-0 right-0 h-full scrollbar-none overflow-y-scroll">
      {props.children}
    </div>
  );
}

export function FlashMessage(props) {
  //   const thisRef = useRef();
  const [fadeClass, setFadeClass] = useState("");
  const timerRef = useRef(null);
  const thisMessageRef = useRef();
  //   let fadeoutClass;
  //   useEffect(() => {
  //     setTimeout(function () {
  //       // in 5 sec, fade this out?
  //       // remove from context
  //         console.dir(thisRef.current.className);
  //         fadeoutClass = "bg-green-500"
  //     }, 1000);

  //     // return () => {
  //     //   // delete this message from messages state array
  //     // };
  //   }, []);
  //   let timer;

  useEffect(() => {
    fadeOutInOrder();
  }, []);

  function delay(delay, v) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null, v), delay);
    });
  }

  function fadeOutInOrder() {
    delay(6000 + 700 * props.position).then(() => {
      setFadeClass(`opacity-0 transition-opacity duration-1000`);
      delay(1000).then(() => props.unmount(props.position));
    });

    // timerRef.current = setTimeout(() => {
    //   setFadeClass("opacity-0 transition-opacity duration-1000");
    // }, 6000 + 700 * props.position);
    // props.unmount(props.position);
  }

  function fadeOut() {
    delay(2000).then(() => {
      setFadeClass(`opacity-0 transition-opacity duration-1000`);
      delay(1000).then(() => props.unmount(props.position));
    });
    // timerRef.current = setTimeout(() => {
    //   setFadeClass("opacity-0 transition-opacity duration-1000");
    // }, 2000);
    // props.unmount(props.position);
  }

  function resetFadeout() {
    console.log("timerIsReset");
    setFadeClass("");
    if (timerRef.current) clearTimeout(timerRef.current);
    // clearTimeout(timer);
    fadeOut();
  }

  //   fadeOut();

  let charm;
  const message = props.message ? props.message : props.type;
  switch (props.type) {
    case "alert":
      charm = <InformationCircleIcon className="w-6 mr-2 text-amber-500" />;

      break;
    case "success":
      charm = <CheckCircleIcon className="w-6 mr-2 text-green-600" />;

      break;
    case "error":
      charm = <ExclamationCircleIcon className="w-6 mr-2 text-red-600" />;

      break;
    default:
      charm = null;
      break;
  }

  return (
    <div
      className={`relative m-2 p-2 pr-6 w-96 min-h-[3rem] h-fit bg-gray-500 rounded-xl flex items-center shadow-md z-50 ${fadeClass}`}
      //   ref={thisRef}
      onMouseMove={resetFadeout}
      //   ref={fadeOut}
      ref={thisMessageRef}
    >
      <XIcon className="w-6 absolute top-0 right-0 p-1 text-gray-800 bg-mexican-red-500 rounded-tr-xl rounded-bl-md" />
      {charm}
      <p className="text-gray-900">{message}</p>
    </div>
  );
}
