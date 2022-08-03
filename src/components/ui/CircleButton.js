import { CheckIcon, XIcon } from "@heroicons/react/solid";

function CircleButton(props) {
  let svg;
  let disabled;
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

    default:
      svg = "";
      break;
  }

  // let emphasis = "";
  // if (props.disabled) {
  //   emphasis = "text-mexican-red-400";
  // } else {
  //   emphasis = "hover:bg-slate-600";
  // }
  let emphasis = disabled ? "text-mexican-red-400" : "hover:bg-slate-600";

  return (
    <button
      className={`${emphasis} bg-gray-700 p-2 rounded-full w-fit transition-colors ease-in duration-75`}
      disabled={disabled}
    >
      {svg}
    </button>
  );
}
export default CircleButton;
