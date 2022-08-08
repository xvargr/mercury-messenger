import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mercury",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

export default storage;
