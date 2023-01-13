export default function SelectableMemberBadge(props) {
  const { member, selected, onClick } = props;

  const selectedStyle = selected
    ? "bg-gray-700 bg-opacity-50"
    : "hover:bg-gray-700 hover:bg-opacity-50";

  return (
    <div
      className={`p-1 m-1 ${selectedStyle} cursor-pointer rounded-lg transition-colors duration-75 ease-in-out flex items-center`}
      onClick={() => onClick(member._id)}
    >
      <div className="flex relative shrink-0">
        <img
          className="w-10 h-10 md:w-12 md:h-12 mr-1.5 object-cover rounded-full"
          src={member.userImage.thumbnailSmall || member.userImage.url}
          alt="profile thumbnail"
        />
      </div>
      <div className="truncate">{member.username}</div>
    </div>
  );
}
