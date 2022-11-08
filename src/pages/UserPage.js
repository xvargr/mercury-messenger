import { useContext, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const userObject = {
  name: null,
  image: null,
};

function UserPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setGroupData, setChatData, setGroupMounted } =
    useContext(DataContext);
  const { setFlashMessages } = useContext(FlashContext);
  const { socketClear } = useContext(SocketContext);
  const [inpErr, setInpErr] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [buttonText, setButtonText] = useState("Keep changes");
  const [feedback, setFeedback] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const nameInputRef = useRef();
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
        setGroupData(null);
        setChatData(null);
        setGroupMounted(false);
        navigate("/login");
      })
      .catch((err) => {
        setFlashMessages(err.response.data.messages);
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
          setGroupData(null);
          setChatData(null);
          setGroupMounted(false);
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
    if (userObject.name) userData.append("name", userObject.name);
    if (userObject.image) userData.append("file", userObject.image);

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
        setFlashMessages(res.data.messages);

        navigate("/");
      })
      .catch((err) => {
        setButtonText("Keep changes");
        setInpErr(false);
        setFlashMessages(err.response.data.messages);
      });
  }

  function onUsernameChange(e) {
    userObject.name = e.target.value;
    if (e.target.value.length < 3 || e.target.value.length > 20) {
      setFeedback("username must be 3 to 20 characters");
      setInpErr(true);
    } else {
      setFeedback("");
      setInpErr(false);
    }
    setButtonText("Keep changes");
  }

  function updateImage(data) {
    userObject.image = data;
    setInpErr(false);
    setButtonText("Keep changes");
  }

  function toggleModal(e) {
    if (!modalIsOpen) setModalIsOpen(true);
    if (e.type === "keydown" && e.key === "Escape") {
      setModalIsOpen(false);
      setPasswordFeedback(null);
    } else if (
      e.type === "click" &&
      (e.target.id === "modalBackground" ||
        e.target.id === "modalCloseButton" ||
        e.target.parentElement.id === "modalCloseButton")
    ) {
      setModalIsOpen(false);
      setPasswordFeedback(null);
    }
  }

  function passwordOnChange(input) {
    setPasswordInput(input);
  }

  return (
    <>
      {modalIsOpen ? (
        <DeleteUserModal
          toggle={toggleModal}
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
            className="w-60 mt-4 bg-gray-600 group hover:bg-gray-500"
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
          </InputBox>
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
          onClick={toggleModal}
        >
          delete account
        </div>
      </div>
    </>
  );
}

export default UserPage;
