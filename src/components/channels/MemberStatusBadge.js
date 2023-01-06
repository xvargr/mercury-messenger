export default function MemberStatusBadge(props) {
  const { member, status } = props;

  let statusIndicator;
  switch (status) {
    case "online":
      statusIndicator = "bg-green-500";
      break;

    case "away":
      statusIndicator = "bg-yellow-500";
      break;

    case "busy":
      statusIndicator = "bg-red-500";
      break;

    case "offline":
      statusIndicator = "bg-gray-600";
      break;

    default:
      break;
  }

  return (
    <div className="flex w-11/12 p-1 m-0.5 rounded-lg items-center">
      <div className="flex relative shrink-0">
        <img
          className="w-12 h-12 mr-1.5 object-cover rounded-full"
          src={member.userImage.thumbnailSmall || member.userImage.url}
          alt="profile thumbnail"
        />
        <span
          className={`w-2.5 h-2.5 ${statusIndicator} rounded-full border-solid border-[3px] box-content border-gray-700 absolute right-1.5 bottom-0`}
          title={status}
        ></span>
      </div>
      <div className="truncate text-lg md:text-base">{member.username}</div>
    </div>
  );
}
