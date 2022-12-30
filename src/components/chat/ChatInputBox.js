import { useRef, useState, useEffect, forwardRef } from "react";
import moment from "moment/moment";

import {
  AtSymbolIcon,
  CameraIcon,
  XIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/outline";

import { MentionsSelector } from "../../utils/iterableComponents";

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
        onChange={(e) => {
          props.validate({ field: "file", input: e.target.files[0] });
          props.onChange(e);
        }}
        ref={ref}
      ></input>
    </label>
  );
});

function AddMentionsButton(props) {
  const { passSelection } = props;
  const [expanded, setExpanded] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    passSelection(selectedMembers);
    // eslint-disable-next-line
  }, [selectedMembers]);

  return (
    <>
      {!expanded || (
        <div className="h-32 w-1/2 min-w-[10rem] p-1 absolute -top-[8.5rem] left-0 bg-gray-500 backdrop-blur-sm bg-opacity-70 rounded-lg shadow-md flex overflow-hidden">
          <MentionsSelector
            initialSelection={selectedMembers}
            onSelectionChange={(selection) => setSelectedMembers(selection)}
          />
        </div>
      )}
      <div className="relative">
        <AtSymbolIcon
          className="h-6 w-6 mr-2 text-gray-800 hover:text-gray-700 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        />
        {!selectedMembers.length > 0 || (
          <div className="w-6 h-6 absolute bottom-0 left-0 bg-amber-500 font-semibold rounded-full shadow-md flex justify-center items-center overflow-clip pointer-events-none">
            {selectedMembers.length}
          </div>
        )}
      </div>
    </>
  );
}

function SubmitButton(props) {
  const { onClick, errorState } = props;
  const [errorOpacity, setErrorOpacity] = useState();
  const [submitButtonStyle, setSubmitButtonStyle] = useState();
  const [lastError, setLastError] = useState();

  useEffect(() => {
    if (errorState.fileError || errorState.textError) {
      setErrorOpacity("opacity-100");
      setSubmitButtonStyle("text-mexican-red-600 opacity-70");
      setLastError(errorState.textError || errorState.fileError);
    } else {
      setErrorOpacity("opacity-0");
      setSubmitButtonStyle("text-gray-800 hover:text-gray-700 cursor-pointer");
    }
  }, [errorState]);

  return (
    <>
      <PaperAirplaneIcon
        className={`${submitButtonStyle} h-6 w-6 rotate-90`}
        onClick={onClick}
      />
      <div
        className={`${errorOpacity} h-8 p-1 absolute right-5 -top-10 bg-mexican-red-500 text-gray-200 font-semibold rounded-lg rounded-br-none shadow-md overflow-clip transition-opacity duration-200 ease-in`}
      >
        {lastError}
      </div>
    </>
  );
}

function ChatInputBox(props) {
  const [imageAttached, setImageAttached] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [inputError, setInputError] = useState({
    textError: null,
    fileError: null,
  });

  const textRef = useRef();
  const fileRef = useRef();
  const mentionsRef = useRef();
  const imagePreviewRef = useRef();

  useEffect(() => {
    textRef.current.focus();
  }, []);

  // eslint-disable-next-line
  useEffect(() => {
    if (fileRef.current.value) setImageAttached(true);
    else setImageAttached(false);
  });

  function returnMessageData(e) {
    e.preventDefault();

    const noError = !inputError.textError && !inputError.fileError;
    const formHasContent =
      textRef.current.value.length || fileRef.current.value;

    if (formHasContent && noError) {
      const messageData = {
        mentions: mentionsRef.current || [],
        text: textRef.current.value || null,
        file: fileRef.current.files[0] || null,
        dateString: moment().format(),
        timestamp: Date.now(),
      };

      textRef.current.value = null;
      fileRef.current.value = null;
      mentionsRef.current.value = null;

      props.return(messageData); // todo clear mentions on send
    }
  }

  function validateInput(params) {
    const { field, input } = params;

    if (field === "text") {
      setInputError((prevData) => {
        const dataCopy = { ...prevData };

        if (input.length > 250) {
          dataCopy.textError = "Message exceeds 250 characters";
        } else {
          dataCopy.textError = null;
        }
        return dataCopy;
      });
    }

    if (field === "file") {
      setInputError((prevData) => {
        const dataCopy = { ...prevData };

        if (input.size > 5e6) {
          dataCopy.fileError = "File exceeds 3MB";
        } else {
          dataCopy.fileError = null;
        }
        return dataCopy;
      });
    }
  }

  function updateImageInput(e) {
    const selectedImage = e.target.files[0];
    setImageLoading(true);

    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        imagePreviewRef.current = {
          image: e.target.result,
          filename: selectedImage.name,
        };

        setImageLoading(false);
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  }

  function BlurBackdrop() {
    let blurHeight;
    if (imageAttached) blurHeight = "h-[16rem]";
    else blurHeight = "h-[14%] max-h-32";

    return (
      <>
        <div
          className={`w-full ml-2 ${blurHeight} backdrop-blur-sm bottom-0 -left-2 absolute pointer-events-none blurMask45`}
        ></div>
        <div
          className={`w-full ml-2 ${blurHeight} bg-gray-600 bottom-0 -left-2 absolute pointer-events-none blurMask70`}
        ></div>
      </>
    );
  }

  function ChatImagePreview() {
    function handleClearImage() {
      fileRef.current.value = null;
      setImageAttached(false);
      setInputError((prevData) => {
        const dataCopy = { ...prevData };
        dataCopy.fileError = null;
        return dataCopy;
      });
    }

    if (!imageAttached) return null;

    if (imageLoading) {
      return (
        <div className="w-full h-36 p-4 absolute top-0 flex items-center">
          <div className="w-28 h-28 p-1 bg-gray-600 rounded-md flex flex-col justify-between">
            <div className="flex">
              <div className="w-full overflow-hidden text-gray-200">
                loading...
              </div>
              <XIcon
                className="h-6 w-6 text-mexican-red-500 hover:text-mexican-red-400 cursor-pointer"
                onClick={() => {
                  fileRef.current.value = null;
                  setImageAttached(false);
                }}
              />
            </div>
            <div className="h-[5rem] w-full bg-gray-700 object-cover rounded-b-md animate-pulse"></div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-36 p-4 absolute top-0 flex items-center">
          <div className="w-28 h-28 p-1 bg-gray-600 rounded-md flex flex-col justify-between">
            <div className="flex">
              <div className="w-28 h-6 text-gray-200 overflow-hidden">
                {imagePreviewRef.current?.filename}
              </div>
              <XIcon
                className="h-6 w-6 text-mexican-red-500 hover:text-mexican-red-400 cursor-pointer"
                onClick={handleClearImage}
              />
            </div>
            <img
              src={imagePreviewRef.current.image}
              alt="preview"
              className="h-[5rem] object-cover rounded-b-md"
            />
          </div>
        </div>
      );
    }
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
        <AddMentionsButton
          passSelection={(selection) => (mentionsRef.current = selection)}
        />
        <input
          type="text"
          id="text"
          ref={textRef}
          placeholder="Say something..."
          autoComplete="off"
          className="bg-inherit focus:outline-none flex-grow  font-nunito"
          onChange={(e) =>
            validateInput({ field: "text", input: e.target.value })
          }
        />
        <AttachImageButton
          onChange={updateImageInput}
          validate={validateInput}
          ref={fileRef}
        />
        <SubmitButton onClick={returnMessageData} errorState={inputError} />
      </div>
    </form>
  );
}

export default ChatInputBox;
