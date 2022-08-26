// dependencies
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import passport from "passport";
import LocalStrategy from "passport-local";
// import { Jwt } from "jsonwebtoken"; //? https://www.digitalocean.com/community/tutorials/api-authentication-with-json-web-tokensjwt-and-passport
// import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import bcrypt from "bcryptjs";
import session from "express-session";
// models
import Group from "./models/Group.js";
import Channel from "./models/Channel.js";
import User from "./models/User.js";
// middleware
import {
  validateGroup,
  validateChannel,
  validateImage,
  validateUser,
  validateUserEdit,
} from "./utils/validation.js";
import { asyncErrorWrapper } from "./utils/asyncErrorWrapper.js";
import ExpressError from "./utils/ExpressError.js";
import storage from "./utils/cloudinary.js";
import isLoggedIn from "./utils/isLoggedIn.js";
// global vars, env variables
const app = express();
const PORT = 3100;
const DOMAIN = process.env.APP_DOMAIN;
const upload = multer({ storage }); // multer parses multiform data and set storage to cloudinary

const db = mongoose.connection;
const mongoClient = mongoose
  .connect(process.env.ATLAS_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((m) => m.connection.getClient());
db.on(
  "error",
  console.error.bind(console, "!-> Connection to mongo.db failed")
);
db.once("open", function () {
  console.log("--> Mongo.db connected");
});

// middleware
app.use(
  cors({
    // todo dynamic origin
    origin: DOMAIN,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false, // force resave if not changed
    maxAge: 2.592e8, // 3 days
    saveUninitialized: false, // save new but unmodified
    store: MongoStore.create({
      // mongoUrl: process.env.ATLAS_URL,
      clientPromise: mongoClient,
      touchAfter: 24 * 3600,
      crypto: { secret: process.env.SECRET },
    }), // todo store in database
  })
);

app.use(passport.initialize());
app.use(passport.session());

// todo move this to a middleware file
// ? defining passport's local strategy
passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username }, function (err, user) {
      if (err) throw new ExpressError(err, 500); // there is an error
      if (!user)
        return done(null, false, { message: "Wrong username or password" }); // no user by that username, null error, false user
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) throw new ExpressError(err, 500);
        if (result === true) {
          return done(null, user); // authenticated
        } else {
          return done(null, false, { message: "Wrong username or password" }); // wrong password
        }
      });
    });
  })
);
passport.serializeUser((user, done) => done(null, user.id)); // stores a cookie with the user's id
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
}); // find cookie's user id and match from db

app.get("/clear", async (req, res) => {
  await Channel.deleteMany({});
  await Group.deleteMany({});
  await User.deleteMany({});
  console.log("!!! DELETED EVERYTHING");
  res.send("cleared");
});

// register new user
app.post(
  "/u",
  upload.none(),
  validateUser,
  asyncErrorWrapper(async function (req, res) {
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
  })
);

// update user
app.patch(
  "/u/:uid",
  upload.single("file"),
  validateUserEdit,
  asyncErrorWrapper(async function (req, res) {
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
  })
);

// login user
app.post("/u/login", upload.none(), function (req, res, next) {
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
});

// logout user
app.delete("/u", function (req, res) {
  console.log(`logged out ${req.user.username}`);
  req.logOut((err) => err);
  res.status(200).send("ok"); // ! Check that api is not sending unnecessary info like user hashed pw
}); // ? logout

// todo delete user
app.delete(
  "/u/:uid",
  asyncErrorWrapper(async function (req, res) {
    // ? is sender same as requested delete user?
    // ? pop user from all groups
    // ? delete all messages
    // ? delete group where the only user is deleted user
    // ? delete profile image
    // ? delete user from db

    console.log(req.user);
    res.send("ok");
  })
);

// !
// todo join with link / code
app.post(
  "/g/:gid/join",
  isLoggedIn,
  asyncErrorWrapper(async function (req, res) {
    console.log(req.user);
    console.log(`invite for group ${req.params.gid}`);
    throw new ExpressError("not ok", 400);
    // res.status(200).send("ok");
  })
);

// remove member from group
app.patch(
  "/g/:gid",
  isLoggedIn,
  asyncErrorWrapper(async function (req, res) {
    const group = await Group.findById(req.params.gid)
      .populate({
        path: "members",
        select: ["username", "id"],
      })
      .populate({
        path: "channels",
        populate: ["text", "task"],
      });

    // is user in group? else abort
    const member = group.members.find((member) => member.id === req.user.id);
    if (!member) {
      throw new ExpressError("Invalid request", 400);
    }

    // remove user from group
    group.members.splice(member, 1);

    // delete group if no members left
    if (group.members.length === 0) {
      await group.remove();
    } else {
      await group.save();
    }

    res.send("ok");
  })
);

// todo delete group
// app.patch(
//   "/g/:gid",
//   isLoggedIn,
//   asyncErrorWrapper(async function (req, res) {
//     const group = await Group.findById(req.params.gid).populate({
//       path: "members",
//       select: ["username", "id"],
//     });
//     // is user in group? else abort
//     const member = group.members.find((member) => member.id === req.user.id);
//     if (!member) {
//       throw new ExpressError("Invalid request", 400);
//     }
//     // remove user from group
//     group.members.splice(member, 1);

//     await group.save();

//     res.send("ok");
//   })
// );

// app.delete(
//   "/g/:gid",
//   asyncErrorWrapper(async function (req, res) {
//     console.log(req.user);
//     res.send("ok");
//   })
// );

// app.delete(
//   "/c/:cid",
//   asyncErrorWrapper(async function (req, res) {
//     console.log(req.user);
//     res.send("ok");
//   })
// );

app.post(
  "/g",
  upload.single("file"),
  validateGroup,
  validateImage,
  asyncErrorWrapper(async function (req, res) {
    console.log("authenticated?", req.isAuthenticated());
    if (req.isAuthenticated()) {
      const newGroup = new Group({
        name: req.body.name.trim(),
        image: { url: req.file.path, filename: req.file.filename },
        channels: { text: [], task: [] },
        members: [],
      });

      const user = await User.findById(req.user.id);
      newGroup.members.push(user);

      const newChannel = new Channel({
        name: "General",
        type: "text",
      });
      newGroup.channels.text.push(newChannel);

      // console.log(newGroup);

      await newChannel.save();
      await newGroup.save();

      // console.log(`  > new group "${req.body.name}" made by user xx"`);
      res.status(201).send(`successfully created "${req.body.name}"`);
    } else {
      console.log("user ded");
      res.status(401).send("request not authenticated");
    }
  })
);

// todo use lean() for better performance
app.get("/g", async function (req, res) {
  if (req.isAuthenticated()) {
    const result = await Group.find({ members: req.user }).populate([
      {
        path: "channels",
        populate: [
          { path: "text", model: "Channel" },
          { path: "task", model: "Channel" },
        ],
      },
    ]);
    console.count("sending get");
    res.json(result);
  } else {
    res.status(401).send("request not authenticated");
  }
});

// todo check uniqueness of channel name
// todo check if authorized
app.post(
  "/c",
  upload.none(),
  validateChannel,
  asyncErrorWrapper(async function (req, res) {
    const parentGroup = await Group.findById({ _id: req.body.group });
    const newChannel = new Channel(req.body);

    if (req.body.type === "text") {
      parentGroup.channels.text.push(newChannel);
    } else if (req.body.type === "task") {
      parentGroup.channels.task.push(newChannel);
    } else {
      return res.status(400).send("taskError");
    }

    await newChannel.save();
    await parentGroup.save();

    // console.log(newChannel);
    // console.log(parentGroup.channels);

    console.log(
      `  > new channel "${req.body.name} made in group ${req.body.group}"`
    );
    // console.log(req.body);
    // const newChannel = new Channel(req.body);
    // await newChannel.save((e) => {
    //   if (e) console.log("SAVE-ERR: ", e);
    // });
    res.status(201).send(`successfully created "${req.body.name}"`);
  })
);

// 404 catch
app.all("*", function (req, res, next) {
  console.log("!-> 404 triggered");
  next(new ExpressError("Page Not Found", 404));
});

// Custom Error Handler
app.use(function (err, req, res, next) {
  console.log("!-> handled error");
  const { message = "Something went wrong", status = 500 } = err;
  console.log(status, message);
  // console.log("stack: ", err);
  res.status(status).send({ message });
});

app.listen(PORT, () => {
  console.log(`--> Mercury api listening on port ${PORT}`);
});
