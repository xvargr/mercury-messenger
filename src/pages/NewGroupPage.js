import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
// components
import NewGroupForm from "../components/forms/NewGroupForm";
// context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";

const axiosConfig = {
  headers: { "Content-Type": "multipart/form-data" },
  // onUploadProgress: (progressEvent) => {
  //   let uploadProgress = Math.round(
  //     (progressEvent.loaded * 100) / progressEvent.total
  //   );
  //   console.log(uploadProgress);
  // }, // ? for progress bar if needed
};

function NewGroupPage() {
  const { setGroupMounted } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);
  const navigate = useNavigate();

  function newGroupHandler(groupObject) {
    let newGroupData = new FormData();
    newGroupData.append("name", groupObject.name);
    newGroupData.append("file", groupObject.image);

    const axiosNewGroup = axios.create({ baseURL: "http://localhost:3100" });

    axiosNewGroup
      .post("/g", newGroupData, axiosConfig)
      .then((res) => console.log("success:", res))
      .catch((err) => console.log("error:", err))
      .then(() => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate("/");
      });
  }

  return <NewGroupForm onNewGroup={newGroupHandler} />;
}

export default NewGroupPage;
