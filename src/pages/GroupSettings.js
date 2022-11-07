import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";

// Ui
import ChannelBanner from "../components/chat/ChatBanner";
import InputBox from "../components/ui/InputBox";
import ImageSelectorPreview from "../components/ui/ImageSelectorPreview";

function GroupSettingsPage() {
  const { selectedGroup } = useContext(UiContext);
  const { groupMounted } = useContext(DataContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (
      groupMounted &&
      !selectedGroup?.administrators.some(
        (administrator) => administrator._id === localStorage.userId
      )
    ) {
      pushFlashMessage([{ message: "Unauthorized", type: "error" }]);
      navigate(`/g/${selectedGroup.name}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // console.log(selectedGroup);

  // !
  function updateFormData(data, type) {
    if (type === "name") setFormData({ ...formData, image: data });
    else if (type === "image") setFormData({ ...formData, name: data });
    console.log(data);
    console.log(type);
  }

  // console.log(groupObject);

  if (!groupMounted) {
    return null;
  } else {
    return (
      <div className="w-full bg-gray-600 items-center">
        <ChannelBanner name={"settings"} />
        <div className="w-full h-screen bg-cyan-500 flex flex-col items-center overflow-y-auto scrollbar-dark">
          <div className="flex max-w-4xl w-full h-80 bg-red-500 justify-evenly items-center m-2 shrink-0">
            <ImageSelectorPreview
              imageSrc={selectedGroup.image.url}
              passData={updateFormData}
            />
            <label className="text-lg font-medium text-gray-900 dark:text-gray-400">
              Group Name:
              <InputBox className="bg-gray-700 p-4">
                <input
                  type="text"
                  className="w-80 bg-gray-700 text-gray-300 font-normal focus:outline-none"
                  placeholder="..."
                  defaultValue={selectedGroup.name}
                  onChange={() => updateFormData(null, this)}
                />
              </InputBox>
            </label>
          </div>

          <div className="flex max-w-4xl w-full h-80 bg-red-500 m-2 shrink-0">
            <div>Members</div>
          </div>
        </div>
      </div>
    );
  }
}

export default GroupSettingsPage;
