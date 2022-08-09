import { groupSchema, channelSchema } from "../schemas/Schemas.js";
import ExpressError from "./ExpressError.js";
import { v2 as cloudinary } from "cloudinary";

function validateGroup(req, res, next) {
  const { name } = req.body;
  const validation = groupSchema.validate({
    name,
    image: {
      url: req.file.path,
      filename: req.file.filename,
    },
    // channels: [],
  });

  if (validation.error) {
    // console.log("VALIDATION ERROR : ", validation.error.details[0].message);
    cloudinary.uploader.destroy(req.file.filename);
    next(new ExpressError(validation.error.details[0].message, 400));
  } else if (!req.file) {
    // console.log("VALIDATION ERROR : ", "No image provided");
    next(new ExpressError("No image provided", 400));
  } else {
    // console.log("VALIDATION PASSED");
    next();
  }
}

function validateChannel(req, res, next) {
  const { name, type } = req.body;
  let validation = channelSchema.validate({ name, type });

  if (validation.error) {
    // console.log("VALIDATION ERROR : ", validation.error.details[0].message);
    next(new ExpressError(validation.error.details[0].message, 400)); //! Important, in async functions, we must pass errors on to next
    // throw new ExpressError(...); //! will not work here, app will crash, unhandled error or hang in theres next middleware?
    // * next() will call the next route handler, but if something were to be passed to it, i.e. next(err), the default express error handler will be called (or the next error handler)
  } else {
    // console.log("VALIDATION PASSED");
    next();
  }
}

function validateImage(req, res, next) {
  const image = req.file;
  const accepted = /image\/(png|jpg|jpeg)/;

  if (!accepted.test(image.mimetype)) {
    // console.log("VALIDATION ERROR : ", "Image in wrong format");
    next(new ExpressError("Image in wrong format", 400));
  } else if (image.size > 3145728) {
    // console.log("VALIDATION ERROR : ", "Image is too large");
    cloudinary.uploader.destroy(req.file.filename);
    next(new ExpressError("Image is too large", 400));
  } else {
    // console.log("VALIDATION PASSED");
    next();
  }
}

export { validateGroup, validateChannel, validateImage };
