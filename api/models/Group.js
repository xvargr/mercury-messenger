import mongoose from "mongoose";

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
  }
  // options
);

const Group = mongoose.model("Group", GroupSchema);

export default Group;
