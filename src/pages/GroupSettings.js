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

// utility hooks
import axiosInstance from "../utils/axios";

function GroupSettingsPage() {
  const { selectedGroup, setSelectedGroup, isAdmin } = useContext(UiContext);
  const { dataHelpers } = useContext(DataContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formIsPending, setFormIsPending] = useState(false);
  const [editForm, setFormData] = useState({
    name: "",
    image: null,
    users: {
      toPromote: [],
      toKick: [],
    },
  });
  const nameRef = useRef();
  const navigate = useNavigate();
  const { userGroups } = axiosInstance();

  useEffect(() => {
    if (!isAdmin()) {
      pushFlashMessage([{ message: "Access denied", type: "error" }]);
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  const updateForm = {
    name() {
      setFormData({ ...editForm, name: nameRef.current.value });
    },
    image(data) {
      setFormData({ ...editForm, image: data });
    },
    toKick(userId) {
      // if user already in other action array, remove from that arr
      if (editForm.users.toPromote.includes(userId)) {
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
        if (!editForm.users.toKick.includes(userId)) {
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
      if (editForm.users.toKick.includes(userId)) {
        setFormData((prevData) => {
          prevData.users.toKick = prevData.users.toKick.filter(
            (user) => user !== userId
          );
          return { ...prevData };
        });
      }
      setFormData((prevData) => {
        if (!editForm.users.toPromote.includes(userId)) {
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
    nameChanged() {
      return editForm.name.length > 0 && editForm.name !== selectedGroup.name;
    },
    imageChanged() {
      return editForm.image !== null;
    },
    usersChanged() {
      return (
        editForm.users.toKick.length > 0 || editForm.users.toPromote.length > 0
      );
    },
    hasChanges() {
      return (
        updateForm.nameChanged() ||
        updateForm.imageChanged() ||
        updateForm.usersChanged()
      );
    },
  };

  // detect if changes are made, show confirmation modal if true
  useEffect(() => {
    if (selectedGroup) {
      if (updateForm.hasChanges()) {
        setShowConfirmation(true);
      } else {
        setShowConfirmation(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm]);

  function submitGroupEdit(e) {
    e.preventDefault();
    if (updateForm.hasChanges()) {
      setFormIsPending(true);

      const formData = new FormData();
      if (updateForm.nameChanged()) {
        formData.append("name", editForm.name);
      }
      if (updateForm.imageChanged()) {
        formData.append("file", editForm.image);
      }
      if (updateForm.usersChanged()) {
        if (editForm.users.toKick.length > 0) {
          formData.append("toKick", editForm.users.toKick);
        }
        if (editForm.users.toPromote.length > 0) {
          formData.append("toPromote", editForm.users.toPromote);
        }
      }

      userGroups
        .edit(selectedGroup._id, formData)
        .then((res) => {
          dataHelpers.patchGroup(res.data.group);
          setSelectedGroup(res.data.group);
          pushFlashMessage(res.data.messages);
          updateForm.revertFields();
          setFormIsPending(false);
          navigate(`/g/${res.data.group.name}`);
        })
        .catch((err) => {
          console.log(err);
          if (err.response) pushFlashMessage(err.response.data.messages); // network err has no response key
          setFormIsPending(false);
        });
    }
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
            editForm.users.toKick.includes(member._id)
              ? "kick"
              : editForm.users.toPromote.includes(member._id)
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
                <div className="w-80 h-4 bg-gray-800 text-gray-300 group-hover:bg-gray-700 transition-colors duration-75 ease-in font-normal focus:outline-none animate-pulse"></div>
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
          show={showConfirmation || formIsPending}
          onAccept={submitGroupEdit}
          onReject={updateForm.revertFields}
          pending={formIsPending}
        />
        <form
          className="w-full h-screen flex flex-col items-center overflow-y-auto scrollbar-dark"
          onSubmit={submitGroupEdit}
        >
          <div className="flex flex-col lg:flex-row max-w-4xl w-full h-80 justify-evenly items-center mb-6 mt-12 shrink-0">
            <ImageSelectorPreview
              imageSrc={selectedGroup.image.url}
              passData={updateForm.image}
              showOriginal={editForm.image === null}
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
