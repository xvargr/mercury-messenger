import bcrypt from "bcryptjs";

import User from "../models/User.js";

import passport from "../utils/passportDefine.js";
import ExpressError from "../utils/ExpressError.js";

export async function newUser(req, res) {
  const result = await User.findOne({ username: req.body.username }).lean();
  if (result)
    return res.status(401).json({
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
      },
    });
  });
}

export function logOutUser(req, res) {
  // console.log(`logged out ${req.user.username}`);
  req.logOut((err) => err);
  res.status(200).send("ok"); // ! Check that api is not sending unnecessary info like user hashed pw
}

export function logInUser(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw new ExpressError(err, 500);
    // if (!user)
    // res.send("hi"); // ? is passport just not compatible with ExErr specCase
    if (!user)
      res.status(401).json({
        messages: [{ message: "Wrong username or password", type: "error" }],
      });
    // if (!user) throw new ExpressError("Wrong username or password", 401);
    // ! 500 Cannot read properties of undefined (reading 'catch')
    else {
      req.logIn(user, (err) => {
        if (err) throw new ExpressError(err, 500);
        // console.log("Successfully Authenticated");
        res.status(201).json({
          userData: {
            username: user.username,
            userId: user._id,
            userImage: user.userImage.url,
            userImageSmall: user.userImage.thumbnailSmall,
            userImageMedium: user.userImage.thumbnailMedium,
          },
          messages: [
            { message: "successfully deleted channel", type: "success" },
          ],
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

  res.json({
    userData: {
      username: updateQuery.username,
      userId: updateQuery._id,
      userImage: updateQuery.userImage.url,
      userImageSmall: updateQuery.userImage.thumbnailSmall,
      userImageMedium: updateQuery.userImage.thumbnailMedium,
    },
    messages: [{ message: "successfully edited user", type: "success" }],
  });
}

export async function deleteUser(req, res) {
  // console.log(req.body);
  if (req.user.id !== req.params.uid)
    throw new ExpressError("Unauthorized", 401);

  const user = await User.findById(req.user.id);

  // console.log(user);
  const passwordCheck = await bcrypt.compare(req.body.password, user.password);

  if (!passwordCheck) throw new ExpressError("INCORRECT PASSWORD", 401);
  else await user.remove();

  res.status(200).send("ok");
}
