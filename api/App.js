// dependencies
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import passport from "passport";
import passportLocal from "passport-local";
// import cookieParser from "cookie-parser";
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
} from "./utils/validation.js";
import { asyncErrorWrapper } from "./utils/asyncErrorWrapper.js";
import ExpressError from "./utils/ExpressError.js";
import storage from "./utils/cloudinary.js";
// global vars, env variables
const app = express();
const PORT = 3100;
const DOMAIN = process.env.MERCURY_DOMAIN;
const upload = multer({ storage }); // multer parses multiform data and set storage to cloudinary

const db = mongoose.connection;
mongoose.connect(process.env.ATLAS_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
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

// app.use(express.urlencoded({ extended: true })); // ! <-- might not need this? bc multer

app.use(
  session({
    secret: "testSecret",
    resave: true, // force resave if not changed
    maxAge: 2.592e8, // 3 days
    saveUninitialized: true, // save new but unmodified
    // store: "" // todo store in database
  })
);

// ! replaced with cors module ^
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", DOMAIN);
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.get("/", (req, res) => {
  console.log("GET REQUEST HOME");
  // console.log(req.cookies); // undefined
  res.send("polo");
});

app.get("/clear", async (req, res) => {
  const chan = await Channel.deleteMany({});
  const grp = await Group.deleteMany({});
  console.log("!!! DELETED EVERYTHING");
  res.send(`${chan}, ${grp}`);
});

// * user routes
// GET    /session/new gets the webpage that has the login form
// POST   /session authenticates credentials against database
// DELETE /session destroys session and redirect to /
// GET  /users/new gets the webpage that has the registration form
// POST /users records the entered information into database as a new /user/xxx
// GET  /users/xxx // gets and renders current user data in a profile view
// POST /users/xxx // updates new information about user

// todo add validation
app.post(
  "/u",
  upload.none(),
  asyncErrorWrapper(async function (req, res) {
    // console.log(req.body);
    // res.send(req.body);
    const result = await User.findOne({ username: req.body.username });
    console.log(result);
    if (result) {
      console.log(req.body.username);
      return res.status(400).send("username already exists");
    }

    // const salt = bcrypt.genSaltSync(10);
    // console.log(salt);
    // const hash = bcrypt.hashSync("B4c0//", salt);
    // console.log(hash);
    // bcrypt.compareSync("B4c0//", hash); // true

    const hashedPw = bcrypt.hashSync(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hashedPw,
    });
    await newUser.save();
    console.log(newUser);
    console.log(`  > new user "${req.body.username}" created`);
    res.status(200).send("user created");
  })
);

app.get("/u", upload.none(), function (req, res) {
  console.log("LOGIN");
  console.log(req.body); // ! undefined <== wtf
  console.log(req.body.username);
  console.log(req.body.password);
  res.send(req.body);
}); // ? authenticate against database

// app.delete("/u", function (req, res) {
//   console.log(req.body);
//   res.send(req.body);
// }); // ? logout
// app.get("/u/:user", function (req, res) {
//   console.log(req.body);
//   res.send(req.body);
// }); // ? get user data
// app.post("/u/:user", function (req, res) {
//   console.log(req.body);
//   res.send(req.body);
// }); // ? update user data

// * need routes for /g /c new, /chats post get??

app.post(
  "/g",
  upload.single("file"),
  validateGroup,
  validateImage,
  asyncErrorWrapper(async function (req, res) {
    console.log(`  > new group "${req.body.name}" made by user xx"`);

    const newGroup = new Group({
      name: req.body.name.trim(),
      image: { url: req.file.path, filename: req.file.filename },
      channels: { text: [], task: [] },
    });

    const newChannel = new Channel({
      name: "General",
      type: "text",
    });

    newGroup.channels.text.push(newChannel);

    await newChannel.save((e) => {
      if (e) console.log("SAVE-ERR: ", e);
    });

    await newGroup.save((e) => {
      if (e) console.log("SAVE-ERR: ", e);
    });

    // console.log(newGroup);
    res.status(200).send(`successfully created "${req.body.name}"`);
  })
);

app.get("/g", async function (req, res) {
  const result = await Group.find({}).populate({
    path: "channels",
    populate: [
      { path: "text", model: "Channel" },
      { path: "task", model: "Channel" },
    ],
  });
  // res.sendStatus(500);
  // res.json(result);

  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  await delay(2000).then();
  console.count("sending get");
  res.json(result);
  // res.json([]);
});

// todo check uniqueness of channel name
app.post(
  "/c",
  upload.none(),
  validateChannel,
  asyncErrorWrapper(async function (req, res) {
    // ?
    // ? find associated group and push this group into its channels array
    console.log(req.body);
    const parentGroup = await Group.findById({ _id: req.body.group });
    console.log(parentGroup);

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
    res.status(200).send(`successfully created "${req.body.name}"`);
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
  res.sendStatus(status);
  // res.sendStatus(status).send(message);
  // res.status(400).send({ err });
});

app.listen(PORT, () => {
  console.log(`--> Mercury api listening on port ${PORT}`);
});
