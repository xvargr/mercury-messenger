import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
// components
import NewChannelForm from "../components/forms/NewChannelForm";
//context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";
// utility hooks
import axiosInstance from "../utils/axios";

function NewChannelPage() {
  const { setGroupMounted } = useContext(DataContext);
  const { selectedGroup, setSelectedChannel } = useContext(UiContext);
  const { setFlashMessages } = useContext(FlashContext);
  const [axiosErr, setAxiosErr] = useState({
    message: null,
    status: null,
  });
  const { userChannels } = axiosInstance();

  const navigate = useNavigate();
  function newChannelHandler(channelObject) {
    let newChannelData = new FormData();
    newChannelData.append("group", channelObject.group);
    newChannelData.append("name", channelObject.name);
    newChannelData.append("type", channelObject.type);

    userChannels
      .new(newChannelData)
      .then((res) => {
        setSelectedChannel(null);
        setGroupMounted(false);
        setFlashMessages(res.data.messages);
        navigate(`/g/${selectedGroup.name}`);
      })
      .catch((err) => {
        // setFlashMessages(err.response.data.messages);
        setAxiosErr({
          message: err.response.data.messages[0].message,
          status: err.response.status,
        });
      });
  }

  return <NewChannelForm onNewChannel={newChannelHandler} err={axiosErr} />;
}

export default NewChannelPage;
