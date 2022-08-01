import { CheckIcon } from "@heroicons/react/solid";

function CircleButton(props) {
  let svg;
  switch (props.type) {
    case "submit":
      svg = <CheckIcon className="h-6 w-6" />;
      break;

    default:
      svg = "";
      break;
  }

  return (
    <button className="bg-gray-700 hover:bg-slate-600 p-2 rounded-full w-fit transition-colors ease-in duration-75">
      {svg}
    </button>
  );
}
export default CircleButton;
