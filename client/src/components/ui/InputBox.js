function InputBox(props) {
  function transferFocus(e) {
    props.transferFocus(e);
  }

  return (
    <div
      className={`${
        props.className ?? "bg-gray-700"
      } p-2 m-1 rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-gray-500 hover:file:cursor-pointer hover:file:opacity-80 hover:cursor-text transition-colors duration-75 ease-in outline-none`}
      onClick={transferFocus}
    >
      {props.children}
    </div>
  );
}
export default InputBox;
