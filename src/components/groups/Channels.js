import { Link } from "react-router-dom";

function Channels(props) {
  return (
    <Link
      to={props.name}
      className="hover:bg-slate-600 m-1 p-1 rounded-lg inline-block"
    >
      {props.name}
    </Link>
  );
}

export default Channels;
