import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// components
import NewChannelForm from "../components/forms/NewChannelForm";
//context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";

const axiosConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

function NewChannelPage() {
  const { setGroupMounted } = useContext(DataContext);
  const { selectedGroup, setSelectedChannel } = useContext(UiContext);
  const { setFlashMessages } = useContext(FlashContext);
  const [axiosErr, setAxiosErr] = useState({
    message: null,
    status: null,
  });

  const navigate = useNavigate();
  function newChannelHandler(channelObject) {
    let newChannelData = new FormData();
    newChannelData.append("group", channelObject.group);
    newChannelData.append("name", channelObject.name);
    newChannelData.append("type", channelObject.type);

    const axiosNewChannel = axios.create({
      baseURL: "http://localhost:3100",
      withCredentials: true,
    });

    axiosNewChannel
      .post("/c", newChannelData, axiosConfig)
      .then((res) => {
        setSelectedChannel(null);
        setGroupMounted(false);

        setFlashMessages(res.data.messages);
        navigate(`/g/${selectedGroup.name}`);
      })
      .catch((err) => {
        setAxiosErr({
          message: err.response.data.message,
          status: err.response.status,
        });
      });
  }

  return <NewChannelForm onNewChannel={newChannelHandler} err={axiosErr} />;
}

export default NewChannelPage;
