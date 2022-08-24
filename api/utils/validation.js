import { groupSchema, channelSchema, userSchema } from "../schemas/Schemas.js";
import ExpressError from "./ExpressError.js";
import { v2 as cloudinary } from "cloudinary";

import Group from "../models/Group.js";
// import Channel from "../models/Channel.js";
import User from "../models/User.js";

async function validateGroup(req, res, next) {
  const { name } = req.body;
  const validation = groupSchema.validate({
    name,
    image: {
      url: req.file.path,
      filename: req.file.filename,
    },
  });

  const result = await Group.findOne({ name });
  if (result) {
    cloudinary.uploader.destroy(req.file.filename);
    next(new ExpressError("That name is unavailable", 401));
  }

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

async function validateChannel(req, res, next) {
  const { name, type, group } = req.body;
  let validation = channelSchema.validate({ name, type });

  const result = await Group.findById(group).populate([
    {
      path: "channels",
      populate: [
        { path: "text", model: "Channel" },
        { path: "task", model: "Channel" },
      ],
    },
  ]);

  if (
    type === "text" &&
    result.channels.text.some((channel) => channel.name === name)
  ) {
    next(new ExpressError("There is already a channel by that name", 401));
  } else if (
    type === "task" &&
    result.channels.task.some((channel) => channel.name === name)
  ) {
    next(new ExpressError("There is already a channel by that name", 401));
  }

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

function validateUser(req, res, next) {
  const { username, password } = req.body;
  const validation = userSchema.validate({ username, password });

  if (validation.error) {
    next(new ExpressError(validation.error.details[0].message, 400));
  } else {
    next();
  }
}

async function validateUserEdit(req, res, next) {
  console.log(req.body);
  // console.log(req.file);
  const { id, name } = req.body;

  console.log("id", id);
  console.log("name", name);

  const nameQuery = await User.findOne({ name: "korgs" }); // ! always return admin
  console.log("nameQuery", nameQuery);
  if (nameQuery) next(new ExpressError("Username taken", 400));

  // const idQuery = await User.findById(id);
  // console.log("idQuery", idQuery);

  // if (idQuery) next(new ExpressError("", 400));

  cloudinary.uploader.destroy(req.file.filename);

  next();
}

export {
  validateGroup,
  validateChannel,
  validateImage,
  validateUser,
  validateUserEdit,
};
