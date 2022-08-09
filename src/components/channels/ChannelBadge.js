import { Link } from "react-router-dom";

function ChannelBadge(props) {
  const emphasis =
    props.selected === true ? "bg-gray-600" : "hover:bg-gray-600";

  // pass name to parent onclick
  function passOnClick() {
    props.onClick(props.name);
  }

  return (
    <Link
      onClick={passOnClick}
      to={`c/${props.name}`}
      className={`h-8 w-5/6 m-1 p-2 pt-1 pb-1 ${emphasis} rounded-lg flex transition-colors ease-in duration-75`}
    >
      <div className="truncate">{props.name}</div>
    </Link>
  );
}

export default ChannelBadge;
