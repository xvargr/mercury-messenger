import { useNavigate } from "react-router-dom";
// components
import NewGroupForm from "../components/forms/NewGroupForm";

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
  const navigate = useNavigate();
  function newGroupHandler(groupObject) {
    let newGroupData = new FormData();
    newGroupData.append("name", groupObject.name);
    newGroupData.append("file", groupObject.image);

    // for (let pair of newGroupData.entries()) {
    //   console.log(pair[0] + ", " + pair[1]);
    // }

    axios
      .post("http://localhost:3100/g", newGroupData, axiosConfig)
      .then((res) => console.log("success:", res))
      .catch((err) => console.log("error:", err))
      .then(() => navigate("/"));
  }

  return <NewGroupForm onNewGroup={newGroupHandler} />;
}

export default NewGroupPage;
