import { Link } from "react-router-dom";

function Channels(props) {
  return (
    <Link
      to={`c/${props.name}`}
      className="w-full h-full p-2 pt-1 pb-1 truncate"
    >
      {props.name}
    </Link>
  );
}

export default Channels;
