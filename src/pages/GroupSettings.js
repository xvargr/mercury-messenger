import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// context
import { UiContext } from "../components/context/UiContext";
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";

// Ui
import ChannelBanner from "../components/chat/ChatBanner";
import InputBox from "../components/ui/InputBox";
import ImageSelectorPreview from "../components/ui/ImageSelectorPreview";
import MemberOptions from "../components/ui/MemberOptions";

function GroupSettingsPage() {
  const { selectedGroup } = useContext(UiContext);
  const { groupMounted } = useContext(DataContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });
  const nameRef = useRef();
  const navigate = useNavigate();

  // reroute on unauthorized
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

  const updateForm = {
    name() {
      setFormData({ ...formData, name: nameRef.current.value });
    },
    image(data) {
      setFormData({ ...formData, image: data });
    },
  };

  function submitGroupEdit(e) {
    e.preventDefault();
  }

  const renderCards = {
    memberCards() {
      const adminIds = selectedGroup.administrators.map((admin) => admin._id);
      const reducedMembers = selectedGroup.members.filter(
        (member) => !adminIds.includes(member._id)
      );
      return reducedMembers.map((member) => (
        <MemberOptions memberData={member} isAdmin={false} />
      ));
    },
    adminCards() {
      const adminIds = selectedGroup.administrators.map((admin) => admin._id);
      const reducedMembers = selectedGroup.members.filter((member) =>
        adminIds.includes(member._id)
      );
      return reducedMembers.map((member) => (
        <MemberOptions memberData={member} isAdmin={true} />
      ));
    },
  };

  if (!groupMounted) {
    return null;
  } else {
    return (
      <div className="w-full flex flex-col bg-gray-600 items-center">
        <ChannelBanner name={"settings"} />
        <form
          className="w-full h-screen flex flex-col items-center overflow-y-auto scrollbar-dark"
          onSubmit={submitGroupEdit}
        >
          {/* <div className="flex max-w-4xl w-full h-80 justify-evenly items-center mt-2 shrink-0"> */}
          <div className="flex flex-col lg:flex-row max-w-4xl w-full h-80 justify-evenly items-center mb-6 mt-12 shrink-0">
            <ImageSelectorPreview
              imageSrc={selectedGroup.image.url}
              passData={updateForm.image}
            />
            <label className="text-lg mt-2 lg:mt-0 font-medium text-gray-400">
              Group Name:
              <InputBox
                className="bg-gray-800 p-4 group hover:bg-gray-700"
                transferFocus={(e) => e.target.children.name?.focus()}
              >
                <input
                  type="text"
                  name="name"
                  className="w-80 bg-gray-800 text-gray-300 group-hover:bg-gray-700 transition-colors duration-75 ease-in font-normal focus:outline-none"
                  placeholder="..."
                  defaultValue={selectedGroup.name}
                  onChange={updateForm.name}
                  ref={nameRef}
                />
              </InputBox>
            </label>
          </div>

          <div className="flex flex-col items-center max-w-4xl w-11/12 h-80 m-4 shrink-0">
            <div className="text-lg font-medium text-gray-400">Members</div>
            <div className="bg-gray-800 rounded-md w-full p-2">
              <div className="text-lg font-medium text-gray-400">
                Administrators
              </div>
              <div className="w-full flex flex-col items-center lg:flex-row lg:flex-wrap lg:justify-evenly">
                {renderCards.adminCards()}
              </div>
              <div className="text-lg font-medium text-gray-400">Members</div>
              <div className="w-full flex flex-col items-center lg:flex-row lg:flex-wrap lg:justify-evenly">
                {renderCards.memberCards()}
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default GroupSettingsPage;
