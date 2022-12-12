import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function GroupBadge(props) {
  const [imgSrc, setImgSrc] = useState(props.img);

  // enables dynamic img src, if missing will not fetch new img even if src is changed dynamically
  useEffect(() => {
    setImgSrc(props.img);
  }, [props.img]);

  const emphasis =
    props.selected === true
      ? "border-mexican-red-500 border-solid border-l-4"
      : "";

  function passOnClick() {
    props.onClick(props.name);
  }

  return (
    <Link to={`/g/${props.name}`} key={props.id}>
      <img
        src={imgSrc}
        alt="placeholder"
        className={`h-16 m-3 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in ${emphasis}`}
        onClick={passOnClick}
      />
    </Link>
  );
}

export default GroupBadge;
