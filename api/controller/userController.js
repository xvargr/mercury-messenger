import bcrypt from "bcryptjs";

import User from "../models/User.js";

import passport from "../utils/passportDefine.js";
import ExpressError from "../utils/ExpressError.js";

export async function newUser(req, res) {
  const result = await User.findOne({ username: req.body.username }).lean();
  if (result)
    return res.status(406).json({
      messages: [{ message: "Username taken", type: "error" }],
    });

  const hashedPw = bcrypt.hashSync(req.body.password, 10);

  const newUser = new User({
    username: req.body.username,
    password: hashedPw,
    userImage: {
      url: undefined,
      fileName: undefined,
    },
    userColor: "#83232A",
  });
  await newUser.save();

  const user = await User.findOne({ username: newUser.username });

  req.logIn(user, (err) => {
    if (err) throw err;
    res.status(201).json({
      userData: {
        username: user.username,
        userId: user._id,
        userImage: user.userImage.url,
        userImageSmall: user.userImage.thumbnailSmall,
        userImageMedium: user.userImage.thumbnailMedium,
        userColor: user.userColor,
      },
    });
  });
}

export function logOutUser(req, res) {
  req.logOut((err) => err);
  res.status(200).send("ok");
}

export function logInUser(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw new ExpressError(err, 500);
    if (!user)
      res.status(401).json({
        messages: [{ message: "Wrong username or password", type: "error" }],
      });
    else {
      req.logIn(user, (err) => {
        if (err) throw new ExpressError(err, 500);
        res.status(201).json({
          userData: {
            username: user.username,
            userId: user._id,
            userImage: user.userImage.url,
            userImageSmall: user.userImage.thumbnailSmall,
            userImageMedium: user.userImage.thumbnailMedium,
            userColor: user.userColor,
          },
        });
      });
    }
  })(req, res, next);
}

export async function editUser(req, res) {
  const { name, color } = req.body;
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
  if (color) update.userColor = color;

  const updateQuery = await User.findOneAndUpdate({ _id: uid }, update, {
    new: true,
  });

  res.json({
    userData: {
      username: updateQuery.username,
      userId: updateQuery._id,
      userImage: updateQuery.userImage.url,
      userImageSmall: updateQuery.userImage.thumbnailSmall,
      userImageMedium: updateQuery.userImage.thumbnailMedium,
      userColor: updateQuery.userColor,
    },
    messages: [
      { message: "successfully edited your profile", type: "success" },
    ],
  });
}

export async function deleteUser(req, res) {
  if (req.user.id !== req.params.uid) throw new ExpressError("Forbidden", 403);

  const user = await User.findById(req.user.id);

  const passwordCheck = await bcrypt.compare(req.body.password, user.password);

  if (!passwordCheck) throw new ExpressError("INCORRECT PASSWORD", 403);
  else await user.remove();

  res.status(200).send("ok");
}
