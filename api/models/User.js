import mongoose from "mongoose";
// import passportLocalMongoose from "passport-local-mongoose";

const options = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
}; // by default when a doc is converted into json it will not include virtuals, the option to needs to be passed on to the schema

const UserImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/dndf29tdn/image/upload/v1660641136/mercury/PIA18107_q1t2oc.jpg",
    },
    filename: { type: String, default: "PIA18107_q1t2oc.jpg" },
  },
  options
);
// virtual getter
UserImageSchema.virtual("thumbnailSmall").get(function () {
  return this.url.replace("/upload", "/upload/w_100");
});
UserImageSchema.virtual("thumbnailMedium").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});

const UserSchema = new mongoose.Schema({
  // email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  userImage: UserImageSchema,
});
// this plugin adds a username,
// hash and salt field to store the username,
// the hashed password and the salt value
// UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

export default User;
