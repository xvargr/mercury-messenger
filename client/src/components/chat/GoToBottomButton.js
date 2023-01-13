import { ChevronDoubleDownIcon } from "@heroicons/react/solid";

export default function GoToBottomButton(props) {
  const { visible, passOnClick } = props;

  return (
    <button
      className={`w-14 h-14 lg:w-16 lg:h-16 bg-gray-500 hover:bg-gray-400 shadow-md ${
        visible ? "opacity-0 pointer-events-none" : "opacity-80" // <= this*
      } rounded-full transition-all ease-in-out duration-300 group flex items-center justify-center absolute bottom-20 right-6 md:bottom-24 md:right-14 z-10`}
      onClick={() => passOnClick()}
    >
      <ChevronDoubleDownIcon className="h-10 lg:h-12 text-gray-700 group-hover:text-gray-600 transition-colors ease-in-out duration-300 group" />
    </button>
  );
}
// tailwind opacity transition works if this component is in its own file and not nested in other component
// when classes are applied like this*, it has no transition, as @ condition described above
// previously was nested in parent component
