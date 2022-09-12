import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import Group from "../models/Group.js";
import ExpressError from "../utils/ExpressError.js";

const options = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
}; // by default when a doc is converted into json it will not include virtuals, the option to needs to be passed on to the schema

const UserImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/dndf29tdn/image/upload/v1660641136/mercury/PIA18107_q1t2oc.jpg",
    },
    filename: { type: String, default: "PIA18107_q1t2oc.jpg" },
  },
  options
);
// virtual getter
UserImageSchema.virtual("thumbnailSmall").get(function () {
  return this.url.replace("/upload", "/upload/w_100");
});
UserImageSchema.virtual("thumbnailMedium").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});

const UserSchema = new mongoose.Schema({
  // email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  userImage: UserImageSchema,
});

// user pre remove cleanup,
// delete from all groups, and destroy user image
UserSchema.pre("remove", async function (next) {
  // console.log("user", this);

  const groups = await Group.find({ members: this }).populate([
    { path: "channels", populate: ["text", "task"] },
    { path: "administrators", select: ["_id", "username"] },
    {
      path: "members",
      select: ["_id", "username"],
    },
  ]);
  // console.log("groups", groups);

  groups.forEach((group) => {
    // find and remove user from members
    // console.log("group", group);
    const memberIndex = group.members.findIndex((member) =>
      member._id.equals(this._id)
    );
    if (memberIndex === -1) throw new ExpressError();
    group.members.splice(memberIndex, 1);

    // find and remove user from admins if is one
    const adminIndex = group.administrators.findIndex((admin) =>
      admin._id.equals(this._id)
    );
    if (adminIndex >= 0) group.administrators.splice(adminIndex, 1);
  });
  // console.log(groups);

  // delete profile image if not default
  // might not want to hardcode this
  if (this.userImage.filename !== "PIA18107_q1t2oc.jpg")
    cloudinary.uploader.destroy(this.userImage.filename);

  groups.forEach(async (group) => {
    await group.save();
  });
  // todo delete all messages
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
