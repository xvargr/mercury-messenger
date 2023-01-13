function Dots(props) {
  return (
    <span className={props.className}>
      <svg
        className="h-2 animate-pulseIndefinitely0 inline"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>
      <svg
        className="h-2 animate-pulseIndefinitely1 inline"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>
      <svg
        className="h-2 animate-pulseIndefinitely2 inline"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>
    </span>
  );
}

export default Dots;
