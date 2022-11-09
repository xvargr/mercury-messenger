import { BanIcon, UserAddIcon } from "@heroicons/react/outline";

function MemberOptions(props) {
  const { memberData, isAdmin } = props;
  return (
    <div className="w-4/5 lg:w-5/12 min-w-max bg-gray-600 hover:bg-gray-500 transition-colors ease-in duration-75 p-2 m-2 rounded-md flex justify-between shrink-0">
      <div className="w-3/4 flex">
        <div className="w-1/3 mr-2 shrink-0">
          <img
            src={memberData.userImage.thumbnailSmall}
            alt="user"
            className="rounded-full h-16 w-16"
          />
        </div>
        <span
          className={`w-2/3 font-bold shrink-0`}
          style={{ color: memberData.userColor }}
        >
          {memberData.username}
          <span className="text-gray-900 text-sm opacity-40">
            {!isAdmin || " (admin)"}
          </span>
        </span>
      </div>
      <div className="w-10 flex flex-col justify-between items-end">
        <UserAddIcon className="text-gray-900 w-6 shrink-0" />
        <BanIcon className="text-gray-900 w-6 shrink-0" />
      </div>
    </div>
  );
}

export default MemberOptions;
