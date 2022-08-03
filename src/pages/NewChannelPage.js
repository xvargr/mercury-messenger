import { useNavigate } from "react-router-dom";
// components
import NewChannelForm from "../components/forms/NewChannelForm";

const axios = require("axios").default;
const axiosConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

function NewChannelPage() {
  const navigate = useNavigate();
  function newChannelHandler(channelObject) {
    let newChannelData = new FormData();
    newChannelData.append("name", channelObject.name);
    newChannelData.append("type", channelObject.type);

    // for (let pair of newChannelData.entries()) {
    //   console.log(pair[0] + ", " + pair[1]);
    // }

    axios
      .post("http://localhost:3100/c", newChannelData, axiosConfig)
      .then((res) => console.log("success:", res))
      .catch((err) => console.log("error:", err))
      .then(() => navigate("/"));
  }

  return <NewChannelForm onNewChannel={newChannelHandler} />;
}

export default NewChannelPage;
