import { useEffect, useState } from "react";

export default function ReplyViewer(props) {
  const { reply } = props;
  const [opacity, setOpacity] = useState("opacity-0");

  useEffect(() => {
    setTimeout(() => {
      setOpacity("opacity-100");
    }, 500);
  }, []);

  function messageContents() {
    const stack = [];

    reply.content.forEach((content) => {
      if (content.file) {
        stack.push(
          <img
            className="w-1/3"
            src={content.file.reduced}
            alt="attached"
            key={`${content.timestamp}img`}
          />
        );
      }
      stack.push(
        <div className="break-words" key={content.timestamp}>
          {content.text}
        </div>
      );
    });
    return stack;
  }

  return (
    <div className="relative w-full flex md:flex-none justify-center md:justify-start">
      <div
        className={`w-3/4 md:max-w-md p-2 text-gray-800 ${opacity} bg-gray-500 bg-opacity-80 rounded-lg shadow-lg absolute bottom-0 md:left-10 backdrop-blur-sm transition-opacity duration-200`}
      >
        <div className="font-semibold">{reply.sender.username}:</div>
        <div>{messageContents()}</div>
      </div>
    </div>
  );
}
