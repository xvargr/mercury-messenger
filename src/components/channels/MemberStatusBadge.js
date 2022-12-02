export default function MemberStatusBadge(props) {
  const { member, status } = props;

  let statusIndicator;
  switch (status) {
    case "online":
      statusIndicator = "border-2 bg-green-500";
      break;

    case "away":
      statusIndicator = "border-2 bg-yellow-500";
      break;

    case "busy":
      statusIndicator = "border-2 bg-red-500";
      break;

    case "offline":
      statusIndicator = "border-2 bg-gray-600";
      break;

    default:
      break;
  }

  return (
    <div className="flex w-11/12 p-1 m-0.5 rounded-lg items-center">
      <div className="flex relative shrink-0">
        <img
          className="w-10 h-10 md:w-12 md:h-12 xl:w-14 xl:h-14 mr-1.5 object-cover rounded-full"
          src={member.userImage.thumbnailSmall || member.userImage.url}
          alt="profile thumbnail"
        />
        <span
          className={`w-2 h-2 md:w-2.5 md:h-2.5 ${statusIndicator} rounded-full border-solid md:border-[3px] box-content border-gray-700 absolute right-1.5 bottom-0`}
        ></span>
      </div>
      <div className="truncate">{member.username}</div>
    </div>
  );
}
