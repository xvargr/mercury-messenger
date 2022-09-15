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

export { SkeletonChannel, SkeletonGroup };
