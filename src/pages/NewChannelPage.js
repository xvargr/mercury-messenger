import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// components
import NewChannelForm from "../components/forms/NewChannelForm";
//context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import React from "react";

const axiosConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

function NewChannelPage() {
  const { setGroupMounted } = useContext(DataContext);
  const { setSelectedGroup, setSelectedChannel } = useContext(UiContext);

  const navigate = useNavigate();
  function newChannelHandler(channelObject) {
    let newChannelData = new FormData();
    newChannelData.append("group", channelObject.group);
    newChannelData.append("name", channelObject.name);
    newChannelData.append("type", channelObject.type);

    axios
      .post("http://localhost:3100/c", newChannelData, axiosConfig)
      .then((res) => console.log("success:", res))
      .catch((err) => console.log("error:", err))
      .then(() => {
        setSelectedGroup(null);
        setSelectedChannel(null);
        setGroupMounted(false);
        navigate("/");
      });
  }

  return <NewChannelForm onNewChannel={newChannelHandler} />;
}

export default NewChannelPage;
