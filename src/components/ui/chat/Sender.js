function Sender(props) {
  return (
    <div>
      <img src={props.img} alt="profile" className=" rounded-full" />
      <span>
        <div>{props.username}</div>
        <div>{props.children}</div>
      </span>
    </div>
  );
}

export default Sender;
