// dependencies
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import multer from "multer";
// models
import Group from "./models/Group.js";
import Channel from "./models/Channel.js";
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

app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", DOMAIN);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  console.log("GET REQUEST HOME");
  res.send("polo");
});

app.get("/clear", async (req, res) => {
  const chan = await Channel.deleteMany({});
  const grp = await Group.deleteMany({});
  console.log("!!! DELETED EVERYTHING");
  res.send(`${chan}, ${grp}`);
});

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

app.post(
  "/c",
  upload.none(),
  validateChannel,
  asyncErrorWrapper(async function (req, res) {
    // ?
    // ? find associated group and push this group into its channels array
    console.log(req.body);
    const parentGroup = await Group.findById({ _id: req.body.group }); // ! _id not id, and use findbyid not find one
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
