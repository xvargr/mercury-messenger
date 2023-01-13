import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mercury",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

export function uploadFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "mercury",
          allowedFormats: ["jpeg", "png", "jpg"],
        },
        (err, res) => {
          if (err) {
            console.warn("cloudinary buffer upload failed", err);
            reject(err);
          } else if (res) resolve(res);
        }
      )
      .end(buffer);
  });
}
