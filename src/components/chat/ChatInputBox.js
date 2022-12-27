import { useRef, useState, useEffect, forwardRef } from "react";
import moment from "moment/moment";

import {
  AtSymbolIcon,
  CameraIcon,
  XIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/outline";

const AttachImageButton = forwardRef(function AttachImageButton(props, ref) {
  return (
    <label className="mx-1">
      <CameraIcon className="h-6 w-6 text-gray-800 hover:text-gray-700 cursor-pointer" />
      <input
        type="file"
        name="chatImage"
        id="chatImage"
        className="sr-only"
        accept=".jpg, .jpeg, .png, .gif"
        onChange={props.onChange}
        ref={ref}
      ></input>
    </label>
  );
});

function ChatInputBox(props) {
  const [imageAttached, setImageAttached] = useState(false);

  const textRef = useRef();
  const fileRef = useRef();
  const imagePreviewRef = useRef();

  useEffect(() => {
    textRef.current.focus();
  }, []);

  // eslint-disable-next-line
  useEffect(() => {
    console.log(fileRef.current.value);
    console.log(fileRef.current.files);
    if (fileRef.current.value) setImageAttached(true);
    else setImageAttached(false);
  });

  function returnMessageData(e) {
    e.preventDefault();
    if (textRef.current.value) {
      const messageData = {
        mentions: [],
        text: textRef.current.value || null,
        file: fileRef.current.files[0] || null,
        dateString: moment().format(),
        timestamp: Date.now(),
      };

      // messageData.text = textRef.current.value;
      textRef.current.value = null;
      fileRef.current.value = null;

      console.log("messageData", messageData);

      props.return(messageData);
    }
  }

  function updateImageInput(e) {
    const selectedImage = e.target.files[0];
    console.log(selectedImage);
    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        // setReaderSrc(e.target.result);
        imagePreviewRef.current = e.target.result;
        console.log(e.target.result);
      };
      fileReader.readAsDataURL(e.target.files[0]);
      // passData(e.target.files[0]);
      // console.log(selectedImage);
      // fileRef.current = selectedImage;
    }
  }

  // function AttachFileButton() {
  //   return (
  //     <PaperClipIcon
  //       className="h-6 w-6 mr-1 text-gray-800 hover:text-gray-700 cursor-pointer"
  //       // ref={filesRef}
  //     />
  //   );
  // }

  function BlurBackdrop() {
    let blurHeight;
    if (imageAttached) blurHeight = "h-[16rem]";
    else blurHeight = "h-[14%] max-h-32";

    return (
      <>
        <div
          className={`w-full ml-2 ${blurHeight} backdrop-blur-sm bottom-0 -left-2 absolute blurMask45`}
        ></div>
        <div
          className={`w-full ml-2 ${blurHeight} bg-gray-600 bottom-0 -left-2 absolute blurMask70`}
        ></div>
      </>
    );
  }

  function ChatImagePreview() {
    if (!imageAttached) return null;

    return (
      <div className="w-full h-36 p-4 absolute top-0 flex items-center">
        <div className="w-28 h-28 p-1 bg-gray-600 rounded-md flex flex-col justify-between">
          <div className="flex">
            <div className="w-full overflow-hidden text-white">
              verylongtitlenamefortheselectedfile
            </div>
            <XIcon
              className="h-6 w-6 text-mexican-red-500 hover:text-mexican-red-400 cursor-pointer"
              onClick={() => {
                fileRef.current.value = null;
                setImageAttached(false);
              }}
            />
          </div>
          <img
            src={imagePreviewRef.current}
            alt="preview"
            className="h-[5rem] object-cover rounded-b-md"
          />
          {/* <div className="grow bg-green-500">image</div> */}
        </div>
      </div>
    );
  }

  return (
    <form className="flex justify-center" onSubmit={returnMessageData}>
      <BlurBackdrop />
      <div
        className={`w-4/5 max-w-4xl ${
          imageAttached ? "h-[10.5rem]" : null
        } m-4 p-2 bg-gray-500 rounded-lg flex justify-around items-end shadow-lg absolute bottom-1`}
      >
        <ChatImagePreview />
        <AtSymbolIcon className="h-6 w-6 mr-2 text-gray-800 hover:text-gray-700 cursor-pointer" />
        <input
          type="text"
          id="text"
          ref={textRef}
          placeholder="Say something..."
          autoComplete="off"
          className="bg-inherit focus:outline-none flex-grow  font-nunito"
        />
        <AttachImageButton onChange={updateImageInput} ref={fileRef} />
        <PaperAirplaneIcon
          className="h-6 w-6 rotate-90 text-gray-800 hover:text-gray-700 cursor-pointer"
          onClick={returnMessageData}
        />
      </div>
    </form>
  );
}

export default ChatInputBox;
