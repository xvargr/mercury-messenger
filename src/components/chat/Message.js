import { useEffect, useState } from "react";
import {
  PaperAirplaneIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

function FailedActions(props) {
  const { clusterData, actions, failedIndex } = props.retryObject;
  const content = clusterData.content;
  const [opacity, setOpacity] = useState("");

  function executeRetry() {
    failedIndex.forEach((index) => {
      const { message, target, status, parent } = content[index].failed;
      if (index === 0)
        actions.sendMessage({
          message: { ...message },
          target: { ...target },
          failed: status,
        });
      else
        actions.appendMessage({
          message: { ...message },
          target: { ...target },
          parent: { ...parent },
          failed: status,
        });
    });
  }

  // todo deletion
  function executeRemove() {
    console.warn("remove not done");
    console.log(clusterData);
    // actions.removeLocally();
  }

  useEffect(() => {
    const opacityTimer = setTimeout(() => {
      setOpacity("opacity-0 transition-opacity duration-700"); // why does this not work? : solution, only this component must update, does not work if nested in other component, this retry component was nested in message
    }, 2000);
    return () => {
      clearTimeout(opacityTimer);
    };
  });

  return (
    <div
      className={`bg-gray-500 shadow-md w-1/4 max-w-[9rem] h-6 max-h-6 m-0.5 rounded-md flex justify-around shrink-0 self-baseline relative cursor-pointer ${props.className}`}
    >
      <div
        className={`w-full h-[1.75rem] bg-mexican-red-400 text-center rounded-md font-semibold absolute z-10 pointer-events-none ${opacity} text-ellipsis`}
      >
        failed to send
      </div>
      <span
        className="w-full flex rounded-l-md justify-center hover:bg-gray-400 transition-colors duration-75 group"
        onClick={executeRemove}
      >
        <TrashIcon className="h-full py-0.5 text-gray-900" />
      </span>
      <span className="h-3/4 self-center outline outline-1 outline-gray-800 absolute"></span>
      <span
        className="w-full flex rounded-r-md justify-center hover:bg-gray-400 transition-colors duration-75 group"
        onClick={executeRetry}
      >
        <PaperAirplaneIcon className="h-full py-0.5 text-gray-900 rotate-90" />
      </span>
    </div>
  );
}

function Message(props) {
  const { data, failed, pending, retryObject } = props;

  return (
    <div
      className={`min-h-[1.75rem] w-full ${
        pending || failed ? "opacity-50" : null
      } flex justify-between items-center`}
    >
      <span className="w-full pr-2 font-semibold text-md text-gray-900 break-words">
        {data}
      </span>
      {retryObject ? (
        <FailedActions
          retryObject={retryObject}
          className={pending || failed ? null : "opacity-50"}
        />
      ) : failed ? (
        <ExclamationCircleIcon className="h-6 text-mexican-red-600" />
      ) : null}
    </div>
  );
}

export default Message;
