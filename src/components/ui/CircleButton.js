import { CheckIcon, XIcon } from "@heroicons/react/solid";

function CircleButton(props) {
  let svg;
  switch (props.svg) {
    case "check":
      svg = <CheckIcon className="h-6 w-6" />;
      break;

    case "cross":
      svg = <XIcon className="h-6 w-6" />;
      break;

    default:
      svg = "";
      break;
  }

  let emphasis = "";
  if (props.disabled) {
    emphasis = "text-mexican-red-400";
  } else {
    emphasis = "hover:bg-slate-600";
  }

  return (
    <button
      className={`${emphasis} bg-gray-700 p-2 rounded-full w-fit transition-colors ease-in duration-75`}
      disabled={props.disabled}
    >
      {svg}
    </button>
  );
}
export default CircleButton;
