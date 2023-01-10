import { useState } from "react";
import { PhotographIcon } from "@heroicons/react/outline";

export default function ImageSelectorPreview(props) {
  const { imageSrc, passData, loading, showOriginal } = props;
  const [readerSrc, setReaderSrc] = useState(null);

  function imagePreview(e) {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setReaderSrc(e.target.result);
        // imageRef.current.attributes.src.value = e.target.result;
      };
      fileReader.readAsDataURL(e.target.files[0]);
      passData(e.target.files[0]);
    }
  }

  function previewConditions() {
    if (showOriginal && !readerSrc) return imageSrc;
    else if (showOriginal) return imageSrc;
    else if (readerSrc) return readerSrc;
    else return imageSrc;
  }

  if (loading || !imageSrc) {
    return (
      <div className="w-[15rem] h-[15rem] md:w-72 md:h-72 grow-0 shrink-0 rounded-full bg-gray-500 animate-pulse"></div>
    );
  } else {
    return (
      <>
        <label htmlFor="image" className="group relative hover:cursor-pointer">
          <PhotographIcon
            className={
              "absolute top-[4rem] left-[4rem] h-[4rem] sm:top-[5rem] sm:left-[5rem] sm:h-[5rem] md:top-[6rem] md:left-[6rem] md:h-[6rem] text-gray-400  opacity-0 hover:cursor-pointer group-hover:opacity-100 transition-all duration-100 z-10"
            }
          />
          <div className="group-hover:brightness-[0.4] group-hover:cursor-pointer transition-all duration-100">
            <img
              src={previewConditions()}
              alt="profile"
              className="w-[12rem] h-[12rem] sm:w-[15rem] sm:h-[15rem] md:w-72 md:h-72 rounded-full object-cover"
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
}
