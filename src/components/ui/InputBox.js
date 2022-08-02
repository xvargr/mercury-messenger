function InputBox(props) {
  return (
    <div className="bg-gray-700 p-2 m-1 w-full rounded-md text-sm drop-shadow-md text-grey-500 file:mr-5 file:py-2 file:px-10 file:rounded-md file:border-0 file:text-md file:font-semibold file:text-gray-300 file:bg-slate-500 hover:file:cursor-pointer hover:file:opacity-80 outline-none">
      {props.children}
    </div>
  );
}
export default InputBox;
