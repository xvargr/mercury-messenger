import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Channel from "./Channel.js";
import Message from "./Message.js";

const options = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
}; // by default when a doc is converted into json it will not include virtuals, the option to needs to be passed on to the schema

// nested schema, needed this to make a virtual .get for cloudinary image resizing
const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
  },
  options
);
// virtual getter
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_100");
});

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      // unique: true,
    },
    image: ImageSchema,
    channels: {
      text: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Channel",
        },
      ],
      task: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Channel",
        },
      ],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    administrators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  options
);

GroupSchema.virtual("inviteLink").get(function () {
  return `/g/${this._id}/join`;
});

// pre delete cleanup
GroupSchema.pre("remove", async function (next) {
  cloudinary.uploader.destroy(this.image.filename);
  // delete associated channels
  const textArr = Array.from(this.channels.text, (channel) => channel.id);
  const taskArr = Array.from(this.channels.task, (channel) => channel.id);

  const channelsArr = [...textArr, ...taskArr];

  // message cleanup is needed here as well as deleting channels using preRemove does not triggers channel preRemove hook
  await Message.deleteMany({
    channel: { $in: channelsArr },
  });

  // if you got a cast error here may be caused by the group not populating necessary fields
  await Channel.deleteMany({
    _id: { $in: channelsArr },
  });

  next();
});

// post save check if empty
GroupSchema.post("save", async function () {
  if (this.members.length === 0) {
    await this.remove();
  }
  // next(); // dunno why next is sometimes needed, and sometimes not
});

const Group = mongoose.model("Group", GroupSchema);

export default Group;
