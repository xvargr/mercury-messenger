import { useRef } from "react";
import { BanIcon, UserAddIcon } from "@heroicons/react/outline";

function ExpandContextButton(props) {
  const expandRef = useRef().current;
  const textRef = useRef();
  const delay = 100; //ms

  function expandOnHover(e) {
    // add dynamic classes on mouse enter
    // remove them on mouse leave
    if (e.type === "mouseenter") {
      // textRef.current.style.transition = "all 100ms ease-out";
      // ! wonky, first time always no transition, sometimes text visible
      // ! after mouse leave transition if triggered quickly
      textRef.current.style.width =
        props.type === "promote" ? "4.5rem" : "2.5rem";
      // textRef.current.innerText = props.type;
      setTimeout(() => {
        textRef.current.style.opacity = "1";
        console.log(textRef.current.style);
        // textRef.current.style.paddingLeft = "0.5rem";
      }, delay);
    } else if (e.type === "mouseleave") {
      textRef.current.style.opacity = "0";
      setTimeout(() => {
        // textRef.current.style.paddingLeft = "0";
        textRef.current.style.width = "0";
        // textRef.current.innerText = null;
      }, delay);
    }
  }

  //   if (e.type === "mouseenter") {
  //     textRef.current.style.width = props.type === "promote" ? "4rem" : "2rem";
  //     textRef.current.innerText = props.type;
  //     setTimeout(() => {
  //       textRef.current.style.opacity = "1";
  //     }, delay);
  //   } else if (e.type === "mouseleave") {
  //     textRef.current.style.opacity = "0";
  //     textRef.current.innerText = null;
  //     setTimeout(() => {
  //       textRef.current.style.width = "0";
  //     }, delay);
  //   }
  // }

  return (
    <div
      className="bg-red-500 p-0.5 rounded-full flex relative"
      onMouseEnter={expandOnHover}
      onMouseLeave={expandOnHover}
      ref={expandRef}
    >
      {props.type === "promote" ? (
        <>
          <span
            // className="transition-all ease-out duration-100 pointer-events-none"
            style={{ opacity: 0, width: 0, pointerEvents: "none" }}
            ref={textRef}
          >
            {props.type}
          </span>
          <UserAddIcon className="text-gray-900 w-6 shrink-0 pointer-events-none" />
        </>
      ) : null}
      {props.type === "kick" ? (
        <>
          <span
            // className="transition-all ease-out duration-100 pointer-events-none"
            style={{ opacity: 0, pointerEvents: "none" }}
            ref={textRef}
          ></span>
          <BanIcon className="text-gray-900 w-6 shrink-0" />
        </>
      ) : null}
    </div>
  );
}

function MemberOptions(props) {
  const { memberData, isAdmin } = props;

  return (
    <div className="w-4/5 lg:w-5/12 min-w-max bg-gray-600 hover:bg-gray-500 transition-colors ease-in duration-75 p-2 m-2 rounded-md flex justify-between shrink-0">
      <div className="w-3/4 flex">
        <div className="w-18 mr-2 shrink-0">
          <img
            src={memberData.userImage.thumbnailSmall}
            alt="user"
            className="rounded-full h-16 w-16"
          />
        </div>
        <span
          className={`w-32 font-bold shrink-0 whitespace-nowrap overflow-hidden text-ellipsis`}
          style={{ color: memberData.userColor }}
        >
          {memberData.username}
          <span className="text-gray-900 text-sm opacity-40">
            {!isAdmin || " (admin)"}
          </span>
        </span>
      </div>
      {isAdmin || (
        <div className="w-10 flex flex-col justify-between items-end">
          <ExpandContextButton type="promote" />
          <ExpandContextButton type="kick" />
        </div>
      )}
    </div>
  );
}

export default MemberOptions;
