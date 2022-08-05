// dependencies
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
// models
import Group from "./models/Group.js";
import Channel from "./models/Channel.js";
// middleware
import {
  validateGroup,
  validateChannel,
  validateImage,
  // uploadImage,
} from "./utils/middleware.js";
import { asyncErrorWrapper } from "./utils/asyncErrorWrapper.js";
import ExpressError from "./utils/ExpressError.js";
// global vars, env variables
const app = express();
const PORT = 3100;
const DOMAIN = process.env.MERCURY_DOMAIN;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mercury",
    allowedFormats: ["jpeg", "png", "jpg"],
    // format: async (req, file) => "png",  // supports promises as well
    // public_id: (req, file) => "computed-filename-using-request",
  },
});
const upload = multer({ storage: storage });

// const upload = multer({ dest: "uploads/" });

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

// app.get("/send", async (req, res) => {
//   const biggie = new Channel({ name: "chan1", type: "text" });
//   // console.log(biggie);
//   const { name, type } = biggie;
//   let thing = channelSchema.validate({ name, type });
//   console.log(thing.error);
//   // await biggie.save((e) => console.log(e));

//   console.log("GET REQUEST");
//   return res.send(thing);
// });

// app.get("/get", async (req, res) => {
//   const result = await Channel.find({ name: "chan1" });

//   console.log("GET REQUEST");
//   res.send(result);
// });

// app.get("/clear", async (req, res) => {
//   const result = await Channel.deleteMany({});

//   console.log("DELETED EVERYTHING");
//   res.send(result);
// });

// * need routes for /g /c new, /chats post get??

app.post(
  "/g",
  upload.single("file"),
  validateGroup,
  validateImage,
  // uploadImage,
  asyncErrorWrapper(async function (req, res) {
    console.log("POST => /G");
    // const newGroup = new Group(req.body);
    // const result = await newGroup.save((e) => console.log("SAVE-ERR: ", e));
    // console.log("res", result);
    res.status(200).send(`successfully posted "${req.body.name}" to /g`);
  })
);

app.post(
  "/c",
  upload.none(),
  validateChannel,
  asyncErrorWrapper(async function (req, res) {
    console.log("POST => /C");
    // const newChannel = new Channel(req.body);
    // const result = await newChannel.save((e) => console.log("SAVE-ERR: ", e));
    // console.log("res", result);
    res.status(200).send(`successfully posted "${req.body.name}" to /c`);
  })
);

// 404 catch
app.all("*", function (req, res, next) {
  console.log("!-> 404 triggered");
  next(new ExpressError(404, "Page Not Found"));
});

// Custom Error Handler
app.use(function (err, req, res, next) {
  console.log("!-> handled error");
  const { message = "Something went wrong", status = 500 } = err;
  console.log(status, message);
  console.log("stack: ", err);
  res.sendStatus(status).send(message);
  // res.status(400).send({ err });
});

app.listen(PORT, () => {
  console.log(`--> Mercury api listening on port ${PORT}`);
});
