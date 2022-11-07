import { useRef } from "react";
import { PhotographIcon } from "@heroicons/react/outline";

export default function ImageSelectorPreview(props) {
  const { imageSrc, passData } = props;
  const imageRef = useRef();

  function imagePreview(e) {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        imageRef.current.attributes.src.value = e.target.result;
      };
      fileReader.readAsDataURL(e.target.files[0]);
      passData(e.target.files[0]);
    }
  }

  return (
    <>
      <label htmlFor="image" className="group hover:cursor-pointer">
        <PhotographIcon
          className={`relative -mt-[6rem] top-[12rem] left-[6rem] text-gray-400 h-[6rem] opacity-0 hover:cursor-pointer group-hover:opacity-100 transition-all duration-100 z-10 ${props.className}`}
        />
        <div className="group-hover:brightness-[0.4] group-hover:cursor-pointer transition-all duration-100">
          <img
            src={imageSrc}
            alt="profile"
            className="w-72 h-72 rounded-full object-cover"
            ref={imageRef}
          />
        </div>
      </label>
      <input
        type="file"
        name="image"
        id="image"
        className="sr-only"
        accept=".jpg, .jpeg, .png, .gif"
        onChange={imagePreview}
      />
    </>
  );
}
