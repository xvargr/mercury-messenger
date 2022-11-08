import { BanIcon, UserAddIcon } from "@heroicons/react/outline";

function MemberOptions(props) {
  const { memberData, isAdmin } = props;
  return (
    <div className="w-5/12 min-w-max bg-gray-500 p-2 m-2 rounded-md flex shrink-0">
      <div className="w-1/4 mr-2 shrink-0">
        <img
          src={memberData.userImage.thumbnailSmall}
          alt="user"
          className="rounded-full h-16 w-16"
        />
      </div>
      <span className="bg-red-500 w-1/4 shrink-0">{memberData.username}</span>
      <div className="bg-gray-600 w-8 h-8 p-1 m-1 rounded-full flex shrink-0">
        <UserAddIcon className="text-gray-900 w-6 h-6" />
      </div>
      <BanIcon className="bg-gray-600 text-gray-900 w-8 h-8 p-1 m-1 rounded-full shrink-0" />
    </div>
  );
}

export default MemberOptions;
