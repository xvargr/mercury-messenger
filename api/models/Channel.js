import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: { type: String, enum: ["text", "task"], required: true },
  // * messages
});
const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
// module.exports = Channel;
