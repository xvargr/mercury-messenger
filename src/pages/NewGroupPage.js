import { useNavigate } from "react-router-dom";
import { useContext } from "react";
// components
import NewGroupForm from "../components/forms/NewGroupForm";
// context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";

const axios = require("axios").default;
const axiosConfig = {
  headers: { "Content-Type": "multipart/form-data" },
  // onUploadProgress: (progressEvent) => { // progress bar
  //   let uploadProgress = Math.round(
  //     (progressEvent.loaded * 100) / progressEvent.total
  //   );
  //   console.log(uploadProgress);
  // },
};

function NewGroupPage() {
  const { setGroupMounted } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const navigate = useNavigate();

  function newGroupHandler(groupObject) {
    let newGroupData = new FormData();
    newGroupData.append("name", groupObject.name);
    newGroupData.append("file", groupObject.image);

    axios
      .post("http://localhost:3100/g", newGroupData, axiosConfig)
      .then((res) => console.log("success:", res))
      .catch((err) => console.log("error:", err))
      .then(() => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false); //! after navigate this is still true!
        navigate("/"); //! confused new channel page with new group page AGAIN!
      });
  }

  return <NewGroupForm onNewGroup={newGroupHandler} />;
}

export default NewGroupPage;
