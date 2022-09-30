import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  text: { type: String, trim: true },
  file: { type: String },
  dateString: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

const messageClusterSchema = new mongoose.Schema(
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
    content: [messageSchema],
    clusterTimestamp: {
      type: Number,
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    methods: {
      async append(contentData) {
        this.content.push(contentData.content);
        await this.save();
      },
    },
  }
);

messageClusterSchema.virtual("lastMessage").get(function () {
  return this.content[this.content.length - 1];
});

messageClusterSchema.pre("validate", function () {
  // console.log("pre validate ran");
  if (!this.clusterTimestamp) {
    this.clusterTimestamp = this.content[0].timestamp;
  }
});

const Message = mongoose.model("Message", messageClusterSchema);

export default Message;
