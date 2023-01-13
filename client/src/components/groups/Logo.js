import { Link } from "react-router-dom";

function Logo(props) {
  return (
    <Link
      className={`w-full h-10 text-mexican-red-600 flex justify-center items-center font-montserrat font-semibold ${props.className}`}
      to="/"
    >
      MERC.
    </Link>
  );
}

export default Logo;
