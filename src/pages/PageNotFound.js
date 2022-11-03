import { useContext } from "react";

import { UiContext } from "../components/context/UiContext";

function PageNotFound() {
  const { selectedGroup, selectedChannel } = useContext(UiContext);
  console.log(selectedGroup);
  console.log(selectedChannel);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-2/3 h-1/5">
        Oops, the page you're looking for cannot be found
      </div>
    </div>
  );
}

export default PageNotFound;
