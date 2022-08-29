import bcrypt from "bcryptjs";

import User from "../models/User.js";

import passport from "../utils/passportDefine.js";
import ExpressError from "../utils/ExpressError.js";

export async function newUser(req, res) {
  const result = await User.findOne({ username: req.body.username }).lean();
  if (result) {
    return res.status(400).send("username already exists");
  }

  const hashedPw = bcrypt.hashSync(req.body.password, 10);

  const newUser = new User({
    username: req.body.username,
    password: hashedPw,
    userImage: {
      url: undefined,
      fileName: undefined,
    },
  });
  await newUser.save();

  const user = await User.findOne({ username: newUser.username });

  req.logIn(user, (err) => {
    if (err) throw err;
    console.log(`Logged in ${user.username}`);
    res.send({
      username: user.username,
      userId: user._id,
      userImage: user.userImage.url,
      userImageSmall: user.userImage.thumbnailSmall,
      userImageMedium: user.userImage.thumbnailMedium,
    });
  });

  console.log(`  > new user "${req.body.username}" created`);
}

export function logOutUser(req, res) {
  console.log(`logged out ${req.user.username}`);
  req.logOut((err) => err);
  res.status(200).send("ok"); // ! Check that api is not sending unnecessary info like user hashed pw
}

export function logInUser(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw new ExpressError(err, 500);
    if (!user) res.status(401).send("Wrong username or password");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        console.log("Successfully Authenticated");
        res.status(201).send({
          username: user.username,
          userId: user._id,
          userImage: user.userImage.url,
          userImageSmall: user.userImage.thumbnailSmall,
          userImageMedium: user.userImage.thumbnailMedium,
        });
      });
    }
  })(req, res, next); // ! <= this for some reason is required, no idea why
}

export async function editUser(req, res) {
  const { name } = req.body;
  const { uid } = req.params;
  const image = req.file;
  const update = {};

  if (name) update.username = name;
  if (image) {
    update.userImage = {
      url: image.path,
      filename: image.filename,
    };
  }

  const updateQuery = await User.findOneAndUpdate({ _id: uid }, update, {
    new: true,
  });

  res.send({
    username: updateQuery.username,
    userId: updateQuery._id,
    userImage: updateQuery.userImage.url,
    userImageSmall: updateQuery.userImage.thumbnailSmall,
    userImageMedium: updateQuery.userImage.thumbnailMedium,
  });
}

export async function deleteUser(req, res) {
  // ? is sender same as requested delete user?
  // ? pop user from all groups
  // ? delete all messages
  // ? delete group where the only user is deleted user
  // ? delete profile image
  // ? delete user from db

  console.log(req.user);
  res.send("ok");
}
