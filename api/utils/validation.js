import {
  groupSchema,
  channelSchema,
  userSchema,
  // messageSchema,
} from "../schemas/Schemas.js";
import ExpressError from "./ExpressError.js";
import { v2 as cloudinary } from "cloudinary";

import Group from "../models/Group.js";
// import Channel from "../models/Channel.js";
import User from "../models/User.js";

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
    if (next)
      next(); // this is a bodge, this func is used in other validation, prevent next from being called if this validator is not called as a middleware
    else return true; // used if this validator is called in another validation func
  }
}

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
    next(new ExpressError("That name is unavailable", 400));
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

async function validateGroupEdit(req, res, next) {
  const { name } = req.body;
  const toKick = req.body.toKick?.split(","); // formData does not support objects or arrays, an alternative method to this it to JSON stringify and parse objects and arrays
  const toPromote = req.body.toPromote?.split(",");

  const result = await Group.findById(req.params.gid).populate([
    { path: "administrators", select: ["_id", "username"] },
    {
      path: "members",
      select: ["_id", "username", "userImage", "userColor"],
    },
  ]);
  if (!result) next(new ExpressError("Group not found", 400));
  if (!result.administrators.map((admin) => admin.id).includes(req.user.id)) {
    next(new ExpressError("You don't have sufficient permissions", 403));
  }

  if (name) {
    const nameSearch = await Group.findOne({ name }).lean();

    if (nameSearch) {
      cloudinary.uploader.destroy(req.file.filename);
      next(new ExpressError("That name is unavailable", 400));
    }
  }

  if (toKick || toPromote) {
    const usersToCheck = [
      ...(toKick ? toKick : []),
      ...(toPromote ? toPromote : []),
    ]; // optional spreading, would be nice to do [...foo?], but [...foo?.bar] is valid
    const usersInGroup = [...result.members].map((member) => member.id);

    const usersValid = usersToCheck.every((incoming) =>
      usersInGroup.some((user) => user === incoming)
    );

    if (!usersValid) next(new ExpressError("Members conflict", 400));
  }

  if (req.file) validateImage(req);

  next();
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

  const requesterIsAdmin = result.administrators.some((administrator) =>
    administrator._id.equals(req.user.id)
  );

  if (
    type === "text" &&
    result.channels.text.some((channel) => channel.name === name)
  ) {
    return next(
      new ExpressError("There is already a channel by that name", 400)
    );
  } else if (
    type === "task" &&
    result.channels.task.some((channel) => channel.name === name)
  ) {
    return next(
      new ExpressError("There is already a channel by that name", 400)
    );
  }

  if (!requesterIsAdmin) {
    return next(
      new ExpressError("Action can only be completed by administrators", 403)
    );
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
  const { name, color } = req.body;
  const { uid } = req.params;
  const image = req.file;
  // console.log("req.body", req.body);

  if (name) {
    const nameQuery = await User.findOne({ username: name });

    if (nameQuery) {
      if (nameQuery.id !== uid) {
        if (image) cloudinary.uploader.destroy(image.filename);
        return next(new ExpressError("Username taken", 400));
      }
    } // else console.log("Username available");
  } else if (name === "null") {
    if (image) cloudinary.uploader.destroy(image.filename);
    return next(new ExpressError("Invalid username", 400));
  }

  if (color) {
    try {
      if (!/^#[0-9a-f]{3,6}$/i.test(color)) {
        return next(new ExpressError("Invalid color", 400));
      }
    } catch {
      return next(new ExpressError("Invalid color", 400));
    }
  }

  const idQuery = await User.findById(uid);
  if (!idQuery) {
    if (image) cloudinary.uploader.destroy(image.filename);
    return next(new ExpressError("Invalid userId", 400));
  } // console.log("UserId valid");
  else if (!name && !image && !color) next(new ExpressError("No changes", 400));

  if (image) cloudinary.uploader.destroy(req.user.userImage.filename);

  next();
}

export {
  validateGroup,
  validateGroupEdit,
  validateChannel,
  validateImage,
  validateUser,
  validateUserEdit,
};
