import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link
      className="w-full h-10 bg-gray-800 text-mexican-red-600 flex justify-center items-center font-montserrat font-semibold"
      to="/"
    >
      MERC.
    </Link>
  );
}

export default Logo;
