function SkeletonGroup(props) {
  return (
    <div className="h-16 m-3 bg-gray-700 w-full rounded-l-lg animate-pulse"></div>
  );
}

function SkeletonChannel(props) {
  return (
    <div className="h-8 w-5/6 m-1 p-2 pt-1 pb-1 bg-gray-600 rounded-lg animate-pulse"></div>
  );
}

function ChatSkeletonLoader(props) {
  function SkeletonMessage() {
    const widthRand = Math.floor(Math.random() * 5) + 1;

    let width;
    switch (widthRand) {
      case 1:
        width = "w-1/2";
        break;
      case 2:
        width = "w-1/3";
        break;
      case 3:
        width = "w-3/5";
        break;
      case 4:
        width = "w-5/6";
        break;
      case 5:
        width = "w-2/3";
        break;

      default:
        break;
    }

    return (
      <div className={`mt-1 bg-gray-700 ${width} h-4 animate-pulse`}></div>
    );
  }

  function SkeletonSender(props) {
    return (
      <div className="pr-3 flex">
        <span className="w-1 mr-3"></span>
        <div className="flex mt-2 mb-2 w-full">
          <div className="w-12 h-12 bg-gray-700 mr-3 rounded-full shrink-0 animate-pulse"></div>
          <span className="flex flex-col w-full">
            <div className="flex justify-between items-center">
              <span className="bg-gray-700 w-32 h-4 mt-1 animate-pulse"></span>
              <span className="bg-gray-700 w-24 h-4 mt-1 animate-pulse"></span>
            </div>
            <div>{props.children}</div>
          </span>
        </div>
      </div>
    );
  }

  // make props.count number of senders with var max number of children messages
  const clusterArray = [];
  for (let i = 0; i < props.count; i++) {
    function RenderSkeletonMessages(max) {
      const count = Math.floor(Math.random() * max) + 1;
      const messages = [];
      for (let n = 0; n < count; n++)
        messages.push(<SkeletonMessage key={n} />);
      return <>{messages.map((message) => message)}</>;
    }

    clusterArray.push(
      <SkeletonSender key={i}>{RenderSkeletonMessages(6)}</SkeletonSender>
    );
  }

  return <>{clusterArray.map((cluster) => cluster)}</>;
}

function SkeletonImageSelecter(params) {}

export { SkeletonChannel, SkeletonGroup, ChatSkeletonLoader };
