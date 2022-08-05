import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // unique: true,
  },
  // image: {
  //   type: String,
  //   required: true,
  // },
  // members: [{type: Schema.Users.id}]

  // * image id, channels, members
});
const Channel = mongoose.model("Group", groupSchema);

export default Channel;
