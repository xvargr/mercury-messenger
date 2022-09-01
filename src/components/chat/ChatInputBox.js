import {
  AtSymbolIcon,
  CameraIcon,
  PaperClipIcon,
} from "@heroicons/react/outline";

function ChatInputBox() {
  return (
    <div className="flex justify-center">
      <div className="w-full ml-2 h-1/6 backdrop-blur-sm bottom-0 absolute blurMask45"></div>
      <div className="w-full ml-2 h-1/6 bg-gray-600 bottom-0 absolute blurMask70"></div>
      <div className="w-4/5 m-4 p-2 bg-gray-500 rounded-lg flex justify-around shadow-lg absolute bottom-1">
        <AtSymbolIcon className="h-6 w-6 mr-2 text-gray-800 hover:text-gray-700 cursor-pointer" />
        <input
          type="text"
          placeholder="Say something..."
          className="bg-inherit focus:outline-none flex-grow font-nunito self-center"
        />
        <CameraIcon className="h-6 w-6 mr-1 text-gray-800 hover:text-gray-700 cursor-pointer" />
        <PaperClipIcon className="h-6 w-6 text-gray-800 hover:text-gray-700 cursor-pointer" />
      </div>
    </div>
  );
}

export default ChatInputBox;
