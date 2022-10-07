import { useRef, useEffect } from "react";
import moment from "moment/moment";

import {
  AtSymbolIcon,
  CameraIcon,
  PaperClipIcon,
} from "@heroicons/react/outline";

function ChatInputBox(props) {
  const textRef = useRef();
  // const filesRef = useRef();
  // const mentionsRef = useRef();

  // console.log(filesRef.current);

  useEffect(() => {
    textRef.current.focus();
  }, []);

  function returnMessageData(e) {
    e.preventDefault();
    if (textRef.current.value) {
      const messageData = {
        mentions: [],
        text: null,
        file: null,
        dateString: moment().format(),
        timestamp: Date.now(),
      };

      messageData.text = textRef.current.value;
      textRef.current.value = null;

      props.return({ messageData, meta: null });
    }
  }

  return (
    <form className="flex justify-center" onSubmit={returnMessageData}>
      <div className="w-full ml-2 h-[14%] max-h-32 backdrop-blur-sm bottom-0 absolute blurMask45"></div>
      <div className="w-full ml-2 h-[14%] max-h-32 bg-gray-600 bottom-0 absolute blurMask70"></div>
      <div className="w-4/5 m-4 p-2 bg-gray-500 rounded-lg flex justify-around shadow-lg absolute bottom-1">
        <AtSymbolIcon
          className="h-6 w-6 mr-2 text-gray-800 hover:text-gray-700 cursor-pointer"
          // ref={mentionsRef}
        />
        <input
          type="text"
          id="text"
          ref={textRef}
          placeholder="Say something..."
          autoComplete="off"
          className="bg-inherit focus:outline-none flex-grow font-nunito self-center"
        />
        <CameraIcon
          className="h-6 w-6 mr-1 text-gray-800 hover:text-gray-700 cursor-pointer"
          // ref={filesRef}
        />
        <PaperClipIcon
          className="h-6 w-6 text-gray-800 hover:text-gray-700 cursor-pointer"
          // ref={filesRef}
        />
      </div>
    </form>
  );
}

export default ChatInputBox;
