function CardFloat(props) {
  return (
    <div
      className={`bg-gray-800 text-gray-400 font-semibold p-8 rounded-xl drop-shadow-lg ${props.className}`}
    >
      {props.children}
    </div>
  );
}

export default CardFloat;
