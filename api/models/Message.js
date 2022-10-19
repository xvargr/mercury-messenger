import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  text: { type: String, trim: true },
  file: { type: String },
  dateString: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

const ClusterSchema = new mongoose.Schema(
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
    content: [MessageSchema],
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
        if (this.content.length === contentData.target.index) {
          this.content.push(contentData.content);
        } else {
          this.content[contentData.target.index] = contentData.content;
        }
        await this.save();
      },
    },
  }
);

ClusterSchema.virtual("lastMessage").get(function () {
  return this.content[this.content.length - 1];
});

ClusterSchema.pre("validate", function () {
  if (!this.clusterTimestamp) {
    this.clusterTimestamp = this.content[0].timestamp;
  }
});

const Message = mongoose.model("Message", ClusterSchema);

export default Message;
