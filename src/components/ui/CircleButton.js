import { CheckIcon, XIcon, LogoutIcon } from "@heroicons/react/solid";

function CircleButton(props) {
  let svg;
  let disabled;

  let bgLight;
  let bgDark;

  switch (props.color) {
    case "gray-600":
      bgLight = "bg-gray-500";
      bgDark = "bg-gray-600";
      break;

    default:
      bgLight = "bg-gray-600";
      bgDark = "bg-gray-700";
      break;
  }

  switch (props.status) {
    case "ok":
      disabled = false;
      svg = <CheckIcon className="h-6 w-6" />;
      break;

    case "error":
      disabled = true;
      svg = <XIcon className="h-6 w-6" />;
      break;

    case "submitted":
      disabled = true;
      svg = (
        <svg
          className="animate-spin h-6 w-6 text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      );
      break;

    case "logout":
      disabled = false;
      svg = <LogoutIcon className="h-6 w-6" />;
      break;

    default:
      svg = "";
      break;
  }

  let emphasis = disabled ? "text-mexican-red-400" : `hover:${bgLight}`;

  return (
    <button
      className={`${bgDark} ${emphasis} p-2 rounded-full w-fit transition-colors ease-in duration-75 ${props.className}`}
      disabled={disabled}
      onClick={props.onClick}
    >
      {svg}
    </button>
  );
}
export default CircleButton;
