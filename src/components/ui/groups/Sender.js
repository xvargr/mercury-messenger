function Sender(props) {
  let highlight;

  if (props.type === "mention") {
    highlight = <span className="bg-amber-500 w-1 mr-3"></span>;
  } else {
    highlight = <span className="w-1 mr-3"></span>;
  }

  return (
    <div className="pr-3 hover:bg-slate-700 flex">
      {highlight}
      <div className="flex mt-2 mb-2 w-full">
        <img
          src={props.img}
          alt="profile"
          className="w-12 h-12 mr-3 rounded-full self-start"
        />
        <span className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <span className="text-mexican-red-700 font-kanit">
              {props.user}
            </span>
            <span className="text-sm opacity-60">{props.timestamp}</span>
          </div>
          <div>{props.children}</div>
        </span>
      </div>
    </div>
  );
}

export default Sender;
