import { useContext, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhotographIcon } from "@heroicons/react/outline";
import axios from "axios";
// context
import { DataContext } from "../components/context/DataContext";
import { FlashContext } from "../components/context/FlashContext";
import { SocketContext } from "../components/context/SocketContext";
// components
import InputBox from "../components/ui/InputBox";
import CircleButton from "../components/ui/CircleButton";
import TextButton from "../components/ui/TextButton";
import { DeleteUserModal } from "../components/ui/Modal";

const userObject = {
  name: null,
  image: null,
};

function UserPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setGroupData, setGroupMounted } =
    useContext(DataContext);
  const { setFlashMessages } = useContext(FlashContext);
  const { socket, setSocket } = useContext(SocketContext);
  const [inpErr, setInpErr] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [buttonText, setButtonText] = useState("Keep changes");
  const [feedback, setFeedback] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const imageRef = useRef();
  const imageInputRef = useRef();

  useEffect(() => {
    imageInputRef.current.value = localStorage.username;
  }, []);

  const axiosConfig = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  const axiosUser = axios.create({
    baseURL: "http://localhost:3100",
    withCredentials: true,
  });

  function logOutUser() {
    axiosUser
      .delete("/u", axiosConfig)
      .then((res) => {
        localStorage.clear();
        if (socket !== null) socket.disconnect();
        setSocket(null);
        setIsLoggedIn(false);
        setGroupData(null);
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

      axiosUser
        .put(`/u/${localStorage.userId}`, userData, axiosConfig)
        .then((res) => {
          localStorage.clear();
          if (socket !== null) socket.disconnect();
          setSocket(null);
          setIsLoggedIn(false);
          setGroupData(null);
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

    axiosUser
      .patch(`/u/${localStorage.userId}`, userData, axiosConfig)
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

        navigate("/");
      })
      .catch((err) => {
        setButtonText("Keep changes");
        setInpErr(false);
        // setFeedback(err.response.data.messages[0].message);
        setFlashMessages(err.response.data.messages);
      });
  }

  function imagePreview(e) {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        imageRef.current.attributes.src.value = e.target.result;
      };
      fileReader.readAsDataURL(e.target.files[0]);
      userObject.image = e.target.files[0];
    }
    setInpErr(false);
    setButtonText("Keep changes");
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

  function toggleModal(e) {
    if (!modalIsOpen) setModalIsOpen(true);
    else if (
      e.key === "Escape" ||
      e.target.id === "modalBackground" ||
      e.target.id === "modalCloseButton"
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
      {/* <DeleteUserModal
        isOpen={modalIsOpen}
        onClick={toggleModal}
        onSubmit={deleteUser}
        ref={modalRef}
      /> */}
      <div className="bg-gray-700 h-full w-full flex flex-col items-center justify-evenly">
        <form
          className="w-4/5 h-4/5 flex flex-col justify-center items-center"
          onSubmit={modifyUser}
        >
          <label htmlFor="userImage" className="group hover:cursor-pointer">
            <PhotographIcon className="relative -mt-[6rem] top-[12rem] left-[6rem] text-gray-400 h-[6rem] opacity-0 hover:cursor-pointer group-hover:opacity-100 transition-all duration-100 z-10" />
            <div className="group-hover:brightness-[0.4] group-hover:cursor-pointer transition-all duration-100">
              <img
                src={localStorage.userImage}
                alt="profile"
                className="w-72 h-72 rounded-full"
                ref={imageRef}
              />
            </div>
          </label>
          <input
            type="file"
            name="userImage"
            id="userImage"
            className="sr-only"
            accept=".jpg, .jpeg, .png, .gif"
            onChange={imagePreview}
          />
          <label htmlFor="username" className="sr-only">
            username
          </label>
          <InputBox className="w-60 mt-4 bg-gray-600">
            <input
              type="text"
              name="username"
              id="username"
              className="block w-full bg-gray-600 focus:outline-none text-center font-semibold text-gray-300"
              onChange={onUsernameChange}
              ref={imageInputRef}
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
          delete acc
        </div>
      </div>
    </>
  );
}

export default UserPage;
