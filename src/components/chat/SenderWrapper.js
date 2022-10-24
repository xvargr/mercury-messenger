import moment from "moment/moment";

function Sender(props) {
  const { sender, children, timestamp, pending } = props;
  let timeText;
  if (timestamp > Date.now() || Date.now() - timestamp < 30000) {
    timeText = "just now";
  } else if (Date.now() - timestamp < 1.8e6) {
    timeText = moment(timestamp).fromNow();
  } else timeText = moment(timestamp).calendar();

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
          src={sender.userImage.thumbnailMedium}
          alt="profile"
          className={`w-12 h-12 mr-3 rounded-full self-start shrink-0 ${
            pending ? "opacity-50" : null
          }`}
        />
        <span className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <span
              className={`text-mexican-red-700 font-kanit ${
                pending ? "opacity-50" : null
              }`}
            >
              {sender.username}
            </span>
            <span className="text-sm opacity-60">{timeText}</span>
          </div>
          <div>{children}</div>
        </span>
      </div>
    </div>
  );
}

export default Sender;
