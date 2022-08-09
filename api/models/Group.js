import mongoose from "mongoose";

const options = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
}; // by default when a doc is converted into json it will not include virtuals, the option to needs to be passed on to the schema

// nested schema, needed this to make a virtual .get for cloudinary image resizing
const ImageSchema = new mongoose.Schema(
  {
    url: String,
    filename: String,
  },
  options
);
// virtual getter
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_100");
});

// const NestedChannelSchema = new mongoose.Schema(
//   {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Channel",
//   },
//   options
// );

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      // unique: true,
    },
    image: ImageSchema,
    // channels: {
    //   text: [NestedChannelSchema],
    //   task: [NestedChannelSchema],
    // },
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
    // channels: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    // ],
    // members: [{type: Schema.Users.id}]

    // todo: are channels schema references?
    // todo: default empty array channels on new groups

    // * image id, channels, members
  }
  // options
);
const Group = mongoose.model("Group", GroupSchema);

export default Group;
