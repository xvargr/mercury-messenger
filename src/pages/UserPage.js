import { useContext, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TwitterPicker } from "react-color";

// Ui
import InputBox from "../components/ui/InputBox";
import CircleButton from "../components/ui/CircleButton";
import TextButton from "../components/ui/TextButton";
import ImageSelectorPreview from "../components/ui/ImageSelectorPreview";
import { DeleteUserModal } from "../components/ui/Modal";

// context
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";
import { SocketContext } from "../components/context/SocketContext";

// utility hooks
import axiosInstance from "../utils/axios";

function UserPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setDataMounted, setChatMounted } =
    useContext(DataContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const { socketClear } = useContext(SocketContext);

  const [formState, setFormState] = useState({});
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");

  const [formData, setFormData] = useState({
    name: localStorage.username || "",
    image: null,
    color: null,
  });

  const nameInputRef = useRef();
  const colorPreviewRef = useRef();

  const { userAccount } = axiosInstance();

  useEffect(() => {
    nameInputRef.current.value = localStorage.username;
  }, []);

  useEffect(() => {
    const error = {};

    if (formData.name !== null) {
      if (formData.name.length < 3 || formData.name.length > 20) {
        error.nameError = "username must be 3 to 20 characters";
      } else if (/[^\w\d ]+/.test(formData.name)) {
        error.nameError = "username must not contain special characters";
      } else if (formData.name === localStorage.username) {
        if (!formData.color && !formData.image) error.nameError = true;
      } else {
        error.nameError = false;
      }
    }
    if (formData.image) {
      if (formData.image.size > 3e6) {
        error.imageError = "image exceeds 3MB";
      } else {
        error.imageError = false;
      }
    }

    setFormState({
      error: error.nameError || error.imageError ? true : false,
      message: error.nameError || error.imageError,
    });
    // eslint-disable-next-line
  }, [formData]);

  function logOutUser() {
    userAccount
      .logOut()
      .then((res) => {
        localStorage.clear();
        socketClear();
        setIsLoggedIn(false);
        setDataMounted(false);
        setChatMounted(false);
        navigate("/login");
      })
      .catch((err) => {
        pushFlashMessage(err.response.data.messages);
      });
  }

  function deleteUser(e) {
    e.preventDefault();

    if (passwordInput) {
      const userData = new FormData();
      userData.append("password", passwordInput);

      userAccount
        .delete(localStorage.userId, userData)
        .then((res) => {
          localStorage.clear();
          socketClear();
          setIsLoggedIn(false);
          setIsLoggedIn(false);
          setDataMounted(false);
          setChatMounted(false);
          navigate("/login");
        })
        .catch((err) =>
          setPasswordFeedback(err.response.data.messages[0].message)
        );
    } else {
      setPasswordFeedback("ENTER YOUR PASSWORD");
    }
  }

  function modifyUser(e) {
    e.preventDefault();

    if (formState.error) return null;

    setFormState({
      error: false,
      pending: true,
      message: null,
    });

    let userData = new FormData();
    if (formData.name) userData.append("name", formData.name);
    if (formData.color) userData.append("color", formData.color);
    if (formData.image) userData.append("file", formData.image);

    userAccount
      .edit(localStorage.userId, userData)
      .then((res) => {
        localStorage.setItem("username", res.data.userData.username);
        localStorage.setItem("userImage", res.data.userData.userImage);
        localStorage.setItem(
          "userImageSmall",
          res.data.userData.userImageSmall
        );
        localStorage.setItem(
          "userImageMedium",
          res.data.userData.userImageMedium
        );
        localStorage.setItem("userColor", res.data.userData.userColor);
        pushFlashMessage(res.data.messages);

        navigate("/");
      })
      .catch((err) => {
        setFormState({
          error: false,
          pending: false,
          message: null,
        });
        pushFlashMessage(err.response.data.messages);
      });
  }

  function updateFormData(params) {
    const { e, data, type } = params;

    function setNewValue(key, value) {
      setFormData({ ...formData, [key]: value });
    }

    if (type === "name") setNewValue(type, e.target.value.trim());
    else if (type === "image") setNewValue(type, e);
    else if (type === "color") {
      setNewValue(type, data.hex);
      colorPreviewRef.current.style.backgroundColor = data.hex;
    }
  }

  function toggleDeleteModal(e) {
    if (!deleteModalIsOpen) setDeleteModalIsOpen(true);
    if (e.type === "keydown" && e.key === "Escape") {
      setDeleteModalIsOpen(false);
      setPasswordFeedback(null);
    } else if (
      e.type === "click" &&
      (e.target.id === "modalBackground" ||
        e.target.id === "modalCloseButton" ||
        e.target.parentElement.id === "modalCloseButton")
    ) {
      setDeleteModalIsOpen(false);
      setPasswordFeedback(null);
    }
  }

  function passwordOnChange(input) {
    setPasswordInput(input);
  }

  return (
    <>
      {deleteModalIsOpen ? (
        <DeleteUserModal
          toggle={toggleDeleteModal}
          onSubmit={deleteUser}
          sendBack={passwordOnChange}
          feedback={passwordFeedback}
        />
      ) : null}

      <div className="bg-gray-700 w-full py-2 flex sm:items-center justify-center">
        <form className="flex flex-col items-center" onSubmit={modifyUser}>
          <ImageSelectorPreview
            imageSrc={localStorage.userImage}
            passData={(e) => updateFormData({ e, type: "image" })}
          />
          <label htmlFor="username" className="sr-only">
            username
          </label>
          <InputBox
            className="w-[16.5rem] sm:w-[16.9rem] mt-4 bg-gray-600 group hover:bg-gray-500 relative"
            transferFocus={(e) => e.target.children.username?.focus()}
          >
            <input
              type="text"
              name="username"
              id="username"
              className="block w-full bg-gray-600 focus:outline-none text-center font-semibold text-gray-300 group-hover:bg-gray-500 transition-colors duration-75 ease-in"
              onChange={(e) => updateFormData({ e, type: "name" })}
              ref={nameInputRef}
              autoComplete="off"
            />
            <span
              className={
                "w-7 h-7 rounded-full border-2 border-gray-400 absolute right-0 top-0 m-1 hover:cursor-pointer"
              }
              style={{ backgroundColor: `${localStorage.userColor}` }}
              ref={colorPreviewRef}
            ></span>
          </InputBox>
          <TwitterPicker
            color={localStorage.userColor}
            colors={[
              "#e74645",
              "#fb7756",
              "#facd60",
              "#fdfa66",
              "#1ac0c6",
              "#072448",
              "#309975",
              "#bbd4ce",
              "#f9b4ab",
              "#d527b7",
            ]}
            className="mt-1 m-6 shadow-md picker-overwrite"
            triangle="top-right"
            onChange={(color, e) =>
              updateFormData({ e, data: color, type: "color" })
            }
          />
          <TextButton
            text={formState.pending ? "processing..." : "keep changes"}
            disabled={formState.error || formState.pending}
          />
          <div className=" h-4 mt-4 -mb-16 text-mexican-red-500 font-bold">
            {!formState.error || formState.message}
          </div>
        </form>

        <div className="flex flex-col items-center justify-between absolute bottom-0">
          <CircleButton
            status="logout"
            className="text-mexican-red-400 hover:text-mexican-red-500"
            color="gray-600"
            onClick={logOutUser}
          />
          <div
            className="mt-2 text-gray-900 hover:cursor-pointer"
            onClick={toggleDeleteModal}
          >
            delete account
          </div>
        </div>
      </div>
    </>
  );
}

export default UserPage;
