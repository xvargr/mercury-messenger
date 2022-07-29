import { Link } from "react-router-dom";

function GroupBadge(props) {
  return (
    <Link to={`/g/${props.name}`} key={props.id}>
      <img
        src={props.img}
        alt="placeholder"
        className="m-3 mr-0 h-20 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in"
        // className="m-3 mr-0 h-14 w-full rounded-l-lg object-cover hover:ml-2 transition-all ease-in"
      />
    </Link>
  );
}

export default GroupBadge;
