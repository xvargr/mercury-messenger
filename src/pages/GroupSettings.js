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
import { ConfirmChangesModal } from "../components/ui/Modal";
import { SkeletonMemberOptions } from "../components/ui/SkeletonLoaders";

function GroupSettingsPage() {
  const { selectedGroup } = useContext(UiContext);
  const { groupMounted } = useContext(DataContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    users: {
      toPromote: [],
      toKick: [],
    },
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    } else if (selectedGroup) {
      setFormData((prevData) => {
        return {
          ...prevData,
          name: selectedGroup.name,
          image: null,
        };
      });
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
    toKick(userId) {
      // if user already in other action array, remove from that arr
      if (formData.users.toPromote.includes(userId)) {
        setFormData((prevData) => {
          prevData.users.toPromote = prevData.users.toPromote.filter(
            (user) => user !== userId
          );
          return { ...prevData };
        });
      }
      // then if not in this action's array, add them.
      // if already in this action's arr, remove them, basically a toggle
      setFormData((prevData) => {
        if (!formData.users.toKick.includes(userId)) {
          prevData.users.toKick.push(userId);
        } else {
          prevData.users.toKick = prevData.users.toKick.filter(
            (id) => id !== userId
          );
        }
        return { ...prevData };
      });
    },
    toPromote(userId) {
      if (formData.users.toKick.includes(userId)) {
        setFormData((prevData) => {
          prevData.users.toKick = prevData.users.toKick.filter(
            (user) => user !== userId
          );
          return { ...prevData };
        });
      }
      setFormData((prevData) => {
        if (!formData.users.toPromote.includes(userId)) {
          prevData.users.toPromote.push(userId);
        } else {
          prevData.users.toPromote = prevData.users.toPromote.filter(
            (id) => id !== userId
          );
        }
        return { ...prevData };
      });
    },
    revertFields() {
      nameRef.current.value = selectedGroup.name;
      setFormData({
        name: selectedGroup.name,
        image: null,
        users: {
          toPromote: [],
          toKick: [],
        },
      });
    },
  };
  console.log(formData);

  // detect if changes are made, show confirmation modal if true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedGroup) {
      const nameChanged =
        formData.name.length > 0 && formData.name !== selectedGroup.name;
      const imageChanged = formData.image !== null;
      const usersChanged =
        formData.users.toKick.length > 0 || formData.users.toPromote.length > 0;

      if (nameChanged || imageChanged || usersChanged) {
        setShowConfirmation(true);
      } else {
        setShowConfirmation(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  function submitGroupEdit(e) {
    e.preventDefault();
    console.log("accept");
  }

  const renderCards = {
    memberCards() {
      const adminIds = selectedGroup.administrators.map((admin) => admin._id);
      const reducedMembers = selectedGroup.members.filter(
        (member) => !adminIds.includes(member._id)
      );
      return reducedMembers.map((member) => (
        <MemberOptions
          memberData={member}
          isAdmin={false}
          promoteEvent={updateForm.toPromote}
          kickEvent={updateForm.toKick}
          selected={
            formData.users.toKick.includes(member._id)
              ? "kick"
              : formData.users.toPromote.includes(member._id)
              ? "promote"
              : false
          }
          key={member._id}
        />
      ));
    },
    adminCards() {
      const adminIds = selectedGroup.administrators.map((admin) => admin._id);
      const reducedMembers = selectedGroup.members.filter((member) =>
        adminIds.includes(member._id)
      );
      return reducedMembers.map((member) => (
        <MemberOptions memberData={member} isAdmin={true} key={member._id} />
      ));
    },
  };

  if (!selectedGroup) {
    return (
      <div className="w-full flex flex-col bg-gray-600 items-center relative">
        <ChannelBanner />
        <div className="w-full h-screen flex flex-col items-center overflow-y-auto scrollbar-dark">
          <div className="flex flex-col lg:flex-row max-w-4xl w-full h-80 justify-evenly items-center mb-6 mt-12 shrink-0">
            <ImageSelectorPreview loading />
            <label className="text-lg mt-2 lg:mt-0 font-medium text-gray-400">
              Group Name:
              <InputBox className="bg-gray-800 p-4 group hover:bg-gray-700 animate-pulse">
                <div className="w-80 bg-gray-800 text-gray-300 group-hover:bg-gray-700 transition-colors duration-75 ease-in font-normal focus:outline-none animate-pulse"></div>
              </InputBox>
            </label>
          </div>

          <div className="flex flex-col items-center max-w-4xl w-11/12 h-80 m-4 shrink-0">
            <div className="text-lg font-medium text-gray-400">Members</div>
            <div className="bg-gray-800 rounded-md w-full p-2 pb-6">
              <div className="text-lg font-medium text-gray-400">
                Administrators
              </div>
              <div className="w-full flex flex-col items-center lg:flex-row lg:flex-wrap lg:justify-evenly">
                <SkeletonMemberOptions />
                <SkeletonMemberOptions />
              </div>
              <div className="text-lg font-medium text-gray-400">Members</div>
              <div className="w-full flex flex-col items-center lg:flex-row lg:flex-wrap lg:justify-evenly">
                <SkeletonMemberOptions />
                <SkeletonMemberOptions />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full flex flex-col bg-gray-600 items-center relative">
        <ChannelBanner name={"settings"} />
        <ConfirmChangesModal
          show={showConfirmation}
          onAccept={submitGroupEdit}
          onReject={updateForm.revertFields}
        />
        <form
          className="w-full h-screen flex flex-col items-center overflow-y-auto scrollbar-dark"
          onSubmit={submitGroupEdit}
        >
          <div className="flex flex-col lg:flex-row max-w-4xl w-full h-80 justify-evenly items-center mb-6 mt-12 shrink-0">
            <ImageSelectorPreview
              imageSrc={selectedGroup.image.url}
              passData={updateForm.image}
              showOriginal={formData.image === null}
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
            <div className="bg-gray-800 rounded-md w-full p-2 pb-6">
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
