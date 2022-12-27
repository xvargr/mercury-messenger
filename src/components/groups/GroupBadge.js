import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function GroupBadge(props) {
  const [imageSource, setImageSource] = useState(props.img);

  // enables dynamic img src, if missing will not fetch new img even if src is changed dynamically
  // still intermittently does not load on change, sometimes on sender, other times on receiver
  useEffect(() => {
    setImageSource(props.img);
  }, [props.img]);

  function UnreadBadge() {
    if (props.unread <= 0) return null;
    else
      return (
        <div className="w-5 h-5 top-0 right-0 bg-mexican-red-400 shadow-md rounded-bl-md font-semibold text-white absolute flex justify-center items-center pointer-events-none">
          {props.unread}
        </div>
      );
  }

  const emphasis =
    props.selected === true
      ? "border-mexican-red-500 border-solid border-l-4"
      : "";

  function passOnClick() {
    props.onClick(props.name);
  }

  return (
    <Link to={`/g/${props.name}`} key={props.id}>
      <div className="relative">
        <img
          id="img22"
          src={imageSource}
          key={imageSource}
          alt="placeholder"
          className={`h-16 m-3 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in ${emphasis}`}
          onClick={passOnClick}
        />
        <UnreadBadge />
      </div>
    </Link>
  );
}

export default GroupBadge;
