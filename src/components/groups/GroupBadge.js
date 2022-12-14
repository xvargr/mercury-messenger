import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function GroupBadge(props) {
  const [imageSource, setImageSource] = useState(props.img);

  // enables dynamic img src, if missing will not fetch new img even if src is changed dynamically
  // still intermittently does not load on change, sometimes on sender, other times on receiver
  useEffect(() => {
    setImageSource(props.img);
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
        id="img22"
        src={imageSource}
        key={imageSource}
        alt="placeholder"
        className={`h-16 m-3 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in ${emphasis}`}
        onClick={passOnClick}
      />
    </Link>
  );
}

export default GroupBadge;
