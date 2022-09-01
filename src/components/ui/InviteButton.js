import { useState } from "react";

export default function InviteButton(props) {
  const link = props.inviteLink;
  const [display, setDisplay] = useState(link);

  function copyLink() {
    setDisplay("COPIED!");
    navigator.clipboard.writeText(link);
  }

  function resetDisplay() {
    setTimeout(function () {
      setDisplay(link);
    }, 200);
  }

  return (
    <button
      className="w-5/6 h-8 mx-4 my-1 px-4 py-1 rounded-lg bg-gray-700 group"
      onClick={copyLink}
      //   onMouseEnter={showLink}
      onMouseLeave={resetDisplay}
    >
      <p className="group-hover:opacity-0 transition-opacity duration-150 delay-75 relative truncate">
        INVITE LINK
      </p>
      <p className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75 -mt-6">
        {display}
      </p>
    </button>
  );
}
