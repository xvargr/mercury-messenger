function ChannelBanner(props) {
  return (
    <div className="w-full h-10 bg-gray-800 flex justify-center items-center text-gray-400 font-montserrat z-30">
      <div className="m-2">{props.name}</div>
    </div>
  );
}

export default ChannelBanner;
