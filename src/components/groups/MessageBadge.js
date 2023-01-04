import { Link } from "react-router-dom";
import { MailIcon } from "@heroicons/react/outline";

export default function MessageBadge(props) {
  // const {unread} = props

  return (
    <Link
      className="relative group"
      to="/m"
      onClick={(e) => {
        e.nativeEvent.stopImmediatePropagation(); // prevents nav to /user from clicking status button
      }}
    >
      <div className="bg-gray-700 p-0.5 w-16 m-2 mt-0 rounded-lg group-hover:rounded-lg transition-all ease-in flex justify-center">
        <MailIcon className="w-8" />
        <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-6"></span>
      </div>
    </Link>
  );
}
