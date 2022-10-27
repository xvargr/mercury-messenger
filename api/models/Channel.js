import mongoose from "mongoose";
import Message from "./Message.js";

const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  type: { type: String, enum: ["text", "task"], required: true },
});

ChannelSchema.pre("remove", async function (next) {
  // delete messages associated with channel
  await Message.deleteMany({ channel: this });

  next();
});

const Channel = mongoose.model("Channel", ChannelSchema);

export default Channel;
