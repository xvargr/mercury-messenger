import moment from "moment/moment";

function Sender(props) {
  let emphasis;
  if (props.type === "mention") {
    emphasis = "bg-amber-500";
  } else {
    emphasis = "";
  }

  return (
    <div className="pr-3 hover:bg-gray-700 flex">
      <span className={`w-1 mr-3 ${emphasis}`}></span>
      <div className="flex mt-2 mb-2 w-full">
        <img
          src={props.user.image}
          alt="profile"
          className="w-12 h-12 mr-3 rounded-full self-start"
        />
        <span className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <span className="text-mexican-red-700 font-kanit">
              {props.user.name}
            </span>
            <span className="text-sm opacity-60">
              {moment(props.timestamp).fromNow()}
            </span>
          </div>
          <div>{props.children}</div>
        </span>
      </div>
    </div>
  );
}

export default Sender;
