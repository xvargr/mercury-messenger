import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  type: { type: String, enum: ["text", "task"], required: true },
});
const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
