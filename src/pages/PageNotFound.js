import { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { UiContext } from "../components/context/UiContext";
import { FlashContext } from "../components/context/FlashContext";

function PageNotFound() {
  // const { selectedGroup, selectedChannel } = useContext(UiContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const navigate = useNavigate();
  // console.log(selectedGroup);
  // console.log(selectedChannel);

  pushFlashMessage([{ message: "Path does not exist", type: "error" }]);
  navigate("/");

  // return (
  //   <div className="w-full h-full flex justify-center items-center">
  //     <div className="w-2/3 h-1/5 text-center">
  //       Oops, the page you're looking for cannot be found
  //     </div>
  //   </div>
  // );
}

export default PageNotFound;
