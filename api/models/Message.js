import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// import User from "./User.js";

// nested schema, needed this to make a virtual .get for cloudinary image resizing
const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);
// virtual getter
ImageSchema.virtual("reduced").get(function () {
  if (this.url) return this.url.replace("/upload", "/upload/w_300");
  else return null;
});

const MessageSchema = new mongoose.Schema({
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  text: { type: String, trim: true },
  file: ImageSchema,
  dateString: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

const ClusterSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    content: [MessageSchema],
    clusterTimestamp: {
      type: Number,
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    methods: {
      async append(params) {
        const { content, target } = params;

        if (this.content.length === target.index) {
          this.content.push(content);
        } else {
          this.content[target.index] = content;
        }
        await this.save();
      },
    },
  }
);

ClusterSchema.virtual("lastMessage").get(function () {
  return this.content[this.content.length - 1];
});

ClusterSchema.virtual("mentions").get(function () {
  let mentions = [];
  this.content.forEach((content) => {
    mentions = [...mentions, ...content.mentions];
  });
  return mentions;
});

ClusterSchema.pre("validate", function () {
  if (!this.clusterTimestamp) {
    this.clusterTimestamp = this.content[0].timestamp;
  }
});

// deletes attached images on connected channel/group deletion
ClusterSchema.pre("deleteMany", async function () {
  const deletedData = await Message.find(this._conditions).lean();
  const imageIds = [];

  deletedData.forEach((data) =>
    data.content.forEach((content) => {
      if (content.file) imageIds.push(content.file.filename);
    })
  );

  if (imageIds.length > 0) {
    cloudinary.api.delete_resources(imageIds).then((res) => console.log(res));
  }
});

const Message = mongoose.model("Message", ClusterSchema);

export default Message;
