import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({});

const Message = mongoose.Model("Message", messageSchema);

export default Message;
