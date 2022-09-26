function Message(props) {
  return (
    <div className={`pt-0.5 ${props.pending ? "opacity-50" : null}`}>
      {props.children}
    </div>
  );
}
export default Message;
