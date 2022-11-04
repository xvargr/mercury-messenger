import { NavLink } from "react-router-dom";

function TextHighlightButton(props) {
  return (
    <NavLink
      to={props.goto}
      className={(state) => {
        // console.log(state);
        // console.log(window.location.pathname);
        // console.log(window.location.hash);
        // console.log(props.hash);
        const active = state.isActive && window.location.hash === props.hash;

        return (
          "block hover:cursor-pointer" +
          (active
            ? "text-gray-300 font-bold"
            : "text-gray-400 hover:text-gray-300")
        );
      }}
    >
      {props.text}
    </NavLink>
  );
}

export default TextHighlightButton;
