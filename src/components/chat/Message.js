import { useEffect, useState } from "react";
import { PaperAirplaneIcon, TrashIcon } from "@heroicons/react/outline";

function FailedActions(props) {
  const retryObject = props;
  const { genesisFailed, clusterData, actions } = retryObject;
  const [opacity, setOpacity] = useState("");

  // ? check if parent cluster failed
  // if so, send new cluster as retry
  function executeRetry() {
    if (genesisFailed) {
      actions.sendMessage();
    }
  }

  // ? if parentCluster is acknowledged, but some messages are not sent
  // send append cluster
  // ? change appendCluster to accept array??
  // ? send append signal one by one
  // ? send new object entirely

  // ! retry duplicates and breaks acknowledgement
  // function executeRetry() {
  //   retry({
  //     message: failed.message,
  //     target: failed.target,
  //     failed: failed.status,
  //     parent: failed.parent,
  //   });
  // }

  function executeRemove() {
    console.log("delete ex");
    actions.remove();
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
    <div className="bg-gray-500 shadow-md w-1/6 max-w-[9rem] h-6 max-h-6 m-0.5 rounded-md flex justify-around shrink-0 self-baseline relative cursor-pointer">
      <div
        className={`w-full h-full bg-mexican-red-400 text-center rounded-md font-semibold absolute z-10 pointer-events-none ${opacity}`}
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
  const { children, failed, pending, retryObject } = props;

  return (
    <div
      className={`h-auto min-h-[1.75rem] ${
        pending || failed ? "opacity-50" : null
      } flex justify-between items-center`}
    >
      {children}
      {retryObject ? <FailedActions retryObject={retryObject} /> : null}
    </div>
  );
}

export default Message;
