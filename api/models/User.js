import mongoose from "mongoose";
// import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  // email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});
// this plugin adds a username,
// hash and salt field to store the username,
// the hashed password and the salt value
// UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

export default User;
