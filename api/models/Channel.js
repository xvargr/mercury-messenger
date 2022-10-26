import mongoose from "mongoose";
import Message from "./Message.js";

import { socketSync } from "../utils/socket.js";

const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  type: { type: String, enum: ["text", "task"], required: true },
});

ChannelSchema.post("save", async function (next) {
  socketSync.emitChanges({
    target: { type: "channel", id: this.id },
    change: { type: "create", data: this },
  });
});

ChannelSchema.pre("remove", async function (next) {
  socketSync.emitChanges({
    target: { type: "channel", id: this.id },
    change: { type: "delete" },
  });

  // delete messages associated with channel
  await Message.deleteMany({ channel: this });

  next();
});

const Channel = mongoose.model("Channel", ChannelSchema);

export default Channel;
