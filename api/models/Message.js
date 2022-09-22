import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  mentions: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, trim: true },
  file: { type: String },
  dateString: { type: String, required: true },
  timestamp: { type: Number, required: true },
  // seen: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  // ],
});

const messageClusterSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    content: [messageSchema],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

messageClusterSchema.virtual("clusterTimestamp").get(function () {
  return this.content[this.content.length - 1].timestamp;
});
messageClusterSchema.virtual("lastMessage").get(function () {
  return this.content[this.content.length - 1];
});

const Message = mongoose.model("Message", messageClusterSchema);

export default Message;
