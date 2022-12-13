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

const userForm = {
  name: "",
  image: null,
  color: null,
};

function UserPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setDataMounted, setChatMounted } =
    useContext(DataContext);
  const { pushFlashMessage } = useContext(FlashContext);
  const { socketClear } = useContext(SocketContext);

  const [inpErr, setInpErr] = useState(true);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [buttonText, setButtonText] = useState("Keep changes");
  const [feedback, setFeedback] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");

  const nameInputRef = useRef();
  const colorPreviewRef = useRef();

  const { userAccount } = axiosInstance();

  useEffect(() => {
    nameInputRef.current.value = localStorage.username;
  }, []);

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
    setButtonText("Processing...");
    setInpErr(true);

    let userData = new FormData();
    if (userForm.name) userData.append("name", userForm.name);
    if (userForm.color) userData.append("color", userForm.color);
    if (userForm.image) userData.append("file", userForm.image);

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
        setButtonText("Keep changes");
        setInpErr(false);
        pushFlashMessage(err.response.data.messages);
      });
  }

  function onUsernameChange(e) {
    userForm.name = e.target.value;
    if (e.target.value.length < 3 || e.target.value.length > 20) {
      setFeedback("username must be 3 to 20 characters");
      setInpErr(true);
    } else {
      setFeedback("");
      setInpErr(false);
    }
    setButtonText("Keep changes");
  }

  function onColorChange(color, e) {
    userForm.color = color.hex;
    colorPreviewRef.current.style.backgroundColor = color.hex;
    setInpErr(false);
    setButtonText("Keep changes");
  }

  function updateImage(data) {
    userForm.image = data;
    setInpErr(false);
    setButtonText("Keep changes");
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

      <div className="bg-gray-700 h-full w-full flex flex-col items-center justify-evenly">
        <form
          className="w-4/5 h-4/5 flex flex-col justify-center items-center"
          onSubmit={modifyUser}
        >
          <ImageSelectorPreview
            imageSrc={localStorage.userImage}
            passData={updateImage}
          />
          <label htmlFor="username" className="sr-only">
            username
          </label>
          <InputBox
            className="w-[16.9rem] mt-4 bg-gray-600 group hover:bg-gray-500 relative"
            transferFocus={(e) => e.target.children.username?.focus()}
          >
            <input
              type="text"
              name="username"
              id="username"
              className="block w-full bg-gray-600 focus:outline-none text-center font-semibold text-gray-300 group-hover:bg-gray-500 transition-colors duration-75 ease-in"
              onChange={onUsernameChange}
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
            className="mt-1"
            triangle="top-right"
            onChange={(color, e) => onColorChange(color, e)}
          />
          <TextButton className="mt-4" text={buttonText} disabled={inpErr} />
          <div className=" h-4 mt-4 -mb-16 text-mexican-red-500 font-bold">
            {feedback}
          </div>
        </form>

        <CircleButton
          status="logout"
          className="text-mexican-red-400 hover:text-mexican-red-500"
          color="gray-600"
          onClick={logOutUser}
        />
        <div
          className="text-gray-900 hover:cursor-pointer"
          onClick={toggleDeleteModal}
        >
          delete account
        </div>
      </div>
    </>
  );
}

export default UserPage;
