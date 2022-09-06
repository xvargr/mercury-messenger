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
  // // console.log(new Date().getTime());
  // todo animations
  // //   const thisRef = useRef();
  const [fadeClass, setFadeClass] = useState("");
  // // const [fadeClass, setFadeClass] = useState("");
  // const timerRef = useRef(null);
  // // const thisMessageRef = useRef();

  // function delay(delay, v) {
  //   return new Promise(function (resolve) {
  //     setTimeout(resolve.bind(null, v), delay);
  //   });
  // }

  // // // function fadeOutInOrder() {
  // // if (props.position === 0) {
  // //   // delay(6000).then(() => {
  // //   //   console.log(`opacity set for ${props.type}`);
  // //   //   setFadeClass(`opacity-0 transition-opacity duration-1000`);
  // //   //   delay(1000).then(() => props.unmount(props.position));
  // //   // });
  // //   // delay(2000).then(() => props.unmount(props.position));
  // //   // }
  // //   // fadeOutInOrder();

  // //   timerRef.current = setTimeout(() => {
  // //     setFadeClass("-translate-y-14 transition-transform duration-1000");
  // //     console.log(props.type, "disappearing");
  // //     delay(1200).then(() => {
  // //       console.log(props.type, "unmounted");
  // //       props.unmount(props.position);
  // //     });
  // //   }, 6000 + 700 * props.position);
  // // }

  // // function fadeOut() {
  // //   // delay(2000).then(() => {
  // //   //   setFadeClass(`opacity-0 transition-opacity duration-1000`);
  // //   //   delay(1000).then(() => props.unmount(props.position));
  // //   // });

  // //   // delay(2000).then(() => props.unmount(props.position));

  // //   timerRef.current = setTimeout(() => {
  // //     setFadeClass("-translate-y-14 transition-transform duration-1000");
  // //     // delay(1000).then(props.unmount(props.position));
  // //   }, 2000);
  // // }

  // // function resetFadeout() {
  // //   setFadeClass("");
  // //   if (timerRef.current) clearTimeout(timerRef.current);
  // //   // clearTimeout(timer);
  // //   fadeOut();
  // // }

  // //   fadeOut();

  // todo anims
  // const fadeClass =
  // props.fadeThis
  // ? // ? "opacity-0 transition-opacity duration-1000"
  //   ""
  // : "";

  // let fadeClass;

  function unmountThis() {
    if (setFadeClass !== "") {
      setFadeClass("translate-x-[26rem] transition-transform duration-1000");
    }
    // delay(1000).then(props.unmount(props.position));
    setTimeout(() => {
      // console.log("unmounting");
      props.unmount(props.position);
    }, 1000);
    // delay(1000).then(console.log("unmounting"));
  }

  let charm;
  const message = props.message ? props.message : props.type;
  switch (props.type) {
    case "alert":
      charm = (
        <div className="h-[3rem] bg-amber-500 rounded-l-xl flex justify-center">
          <InformationCircleIcon className="w-6 m-1 text-gray-600 shrink-0" />
        </div>
      );

      break;
    case "success":
      charm = (
        <div className="h-[3rem] bg-green-600 rounded-l-xl flex justify-center">
          <CheckCircleIcon className="w-6 m-1 text-gray-600 shrink-0" />
        </div>
      );

      break;
    case "error":
      charm = (
        <div className="h-[3rem] bg-red-500 rounded-l-xl flex justify-center">
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
      className={`relative m-2 pr-6 w-96 min-h-[3rem] h-fit rounded-xl backdrop-blur-sm flex items-center shadow-md z-50 ${fadeClass}`}
      //   ref={thisRef}
      // onMouseMove={resetFadeout}
      //   ref={fadeOut}
      // ref={thisMessageRef}
    >
      <div className="w-full h-full absolute -z-10 rounded-xl bg-gray-500 opacity-70"></div>
      <XIcon
        className="w-6 absolute top-0 right-0 p-1 text-gray-800 bg-mexican-red-500 rounded-tr-xl rounded-bl-md"
        onClick={unmountThis}
      />
      {charm}
      <p className="text-gray-900 ml-2">{message}</p>
    </div>
  );
}
