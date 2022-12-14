import { useContext, useState, useEffect } from "react";
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
  const { setGroupData } = useContext(DataContext);
  const { selectedGroup, setSelectedChannel, isAdmin } = useContext(UiContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const [axiosErr, setAxiosErr] = useState({
    message: null,
    status: null,
  });
  const { userChannels } = axiosInstance();

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedGroup) {
      if (!isAdmin()) {
        pushFlashMessage([{ message: "Access denied", type: "error" }]);
        navigate("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  function newChannelHandler(channelObject) {
    let newChannelData = new FormData();
    newChannelData.append("group", channelObject.group);
    newChannelData.append("name", channelObject.name);
    newChannelData.append("type", channelObject.type);

    userChannels
      .new(newChannelData)
      .then((res) => {
        setSelectedChannel(null);

        setGroupData((prevData) => {
          const dataCopy = { ...prevData };

          dataCopy[res.data.groupId].channels.text.push(res.data.channelData);
          dataCopy[res.data.groupId].chatData[res.data.channelData._id] = [];
          return dataCopy;
        });

        pushFlashMessage(res.data.messages);
        navigate(`/g/${selectedGroup.name}`);
      })
      .catch((err) => {
        setAxiosErr({
          message: err.response.data.messages[0].message,
          status: err.response.status,
        });
      });
  }

  return <NewChannelForm onNewChannel={newChannelHandler} err={axiosErr} />;
}

export default NewChannelPage;
