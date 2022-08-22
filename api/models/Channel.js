import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  // group: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Group",
  //   required: true,
  // },
  name: {
    type: String,
    required: true,
  },
  type: { type: String, enum: ["text", "task"], required: true },
  // messages: [
  //   {
  // ?     // ? how do we only populate tha last x messages to reduce bandwidth use
  //     sender: {}, // ? reference to user
  //     message: {},
  //     timestamp: {},
  //   },
  // ],
  // ! the message should store the group, channel and sender
});
const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
// module.exports = Channel;
