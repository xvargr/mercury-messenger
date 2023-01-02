import moment from "moment/moment";
// import { ReplyIcon } from "@heroicons/react/outline";

function Sender(props) {
  const {
    sender,
    children,
    timestamp,
    pending,
    isAdmin,
    userMentioned,
    mentions,
  } = props;

  let timeText;
  if (timestamp > Date.now() || Date.now() - timestamp < 30000) {
    timeText = "just now";
  } else if (Date.now() - timestamp < 1.8e6) {
    timeText = moment(timestamp).fromNow();
  } else timeText = moment(timestamp).calendar();

  let emphasis;
  let emphasisBackground;
  if (userMentioned) {
    emphasis = "bg-amber-500";
    emphasisBackground =
      "bg-amber-500 hover:bg-amber-400 bg-opacity-20 hover:bg-opacity-30";
  } else {
    emphasis = "";
    emphasisBackground = "hover:bg-gray-700";
  }

  function renderMentions() {
    const mentionedNames = mentions.map((user) => user.username);
    const stack = mentionedNames.reduce((accumulator, username, index) => {
      if (index < 2) {
        accumulator.push(
          <span key={username}>
            {username}
            {index === mentionedNames.length - 1 || ","}
          </span>
        );
      } else if (index === 2) {
        accumulator.push(
          <span
            key={username}
            title={mentionedNames.slice(2, mentionedNames.length)}
          >
            + {mentionedNames.length - 2} more
          </span>
        );
      }
      return accumulator;
    }, []);
    return stack;
  }

  return (
    <div className={`${emphasisBackground} pr-3  flex bg-opacity-25`}>
      <span className={`w-1 mr-2 ${emphasis} shrink-0`}></span>
      <div className="flex mt-2 mb-2 w-full">
        <img
          src={sender.userImage.thumbnailMedium}
          alt="profile"
          className={`w-12 h-12 mr-2 rounded-full self-start shrink-0 ${
            pending ? "opacity-50" : null
          }`}
        />
        <span className="w-full flex flex-col overflow-hidden">
          <div className="flex justify-between items-center">
            <span
              className={`font-kanit ${pending ? "opacity-50" : null}`}
              style={{ color: sender.userColor }}
            >
              {sender.username}
              {!mentions.length > 0 || (
                <span className="text-gray-800 pl-0.5 text-sm">
                  @{renderMentions()}
                </span>
              )}
              <span className="text-gray-900 text-sm opacity-40">
                {!isAdmin || " (admin)"}
              </span>
            </span>
            <span className="text-sm opacity-60">{timeText}</span>
          </div>
          {children}
        </span>
      </div>
    </div>
  );
}

export default Sender;
