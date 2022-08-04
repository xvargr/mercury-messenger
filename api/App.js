import express from "express";
import fileUpload from "express-fileupload";
import "dotenv/config";
import mongoose from "mongoose";

import Channel from "./models/Channel.js";
import { channelSchema } from "./schemas/Schemas.js";
// const Channel = require("./model/Channel");

// middleware
import { validateChannel } from "./utils/middleware.js";
import { asyncErrorWrapper } from "./utils/asyncErrorWrapper.js";
import ExpressError from "./utils/ExpressError.js";

const app = express();
const PORT = 3100;
const DOMAIN = process.env.MERCURY_DOMAIN;

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

app.use(fileUpload());
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

app.get("/send", async (req, res) => {
  const biggie = new Channel({ name: "chan1", type: "text" });
  // console.log(biggie);
  const { name, type } = biggie;
  let thing = channelSchema.validate({ name, type });
  console.log(thing.error);
  // await biggie.save((e) => console.log(e));

  console.log("GET REQUEST");
  res.send(thing);
});

app.get("/get", async (req, res) => {
  const result = await Channel.find({ name: "chan1" });

  console.log("GET REQUEST");
  res.send(result);
});

app.get("/clear", async (req, res) => {
  const result = await Channel.deleteMany({});

  console.log("DELETED EVERYTHING");
  res.send(result);
});

// * need routes for /g /c new, /chats post get??

app.post("/g", (req, res) => {
  console.log("POST => GROUPS");
  console.log(req.body);
  console.log(req.files);
  res.send(`POST => /g => ${req.body.name}`);
});

// app.post(
//   "/c",
//   validateChannel,
//   errorWrapper(async (req, res) => {
//     console.log("POST => CHANNELS");
//     const newChannel = new Channel(req.body);
//     const result = await newChannel.save((e) => console.log("SAVE-ERR: ", e));
//     console.log("res", result);
//     res.send(`POST => /c => ${req.body.name}`);
//   })
// );

app.post(
  "/c",
  validateChannel,
  asyncErrorWrapper(async function (req, res) {
    console.log("POST => CHANNELS");
    const newChannel = new Channel(req.body);
    const result = await newChannel.save((e) => console.log("SAVE-ERR: ", e));
    console.log("res", result);
    res.status(200).send(`POST => /c => ${req.body.name}`);
  })
);

// 404 catch
app.all("*", function (req, res, next) {
  console.log("!-> 404 triggered");
  next(new ExpressError(404, "Page Not Found")); // create new ExpErr with msg and status properties
});

// Custom Error Handler
app.use(function (err, req, res, next) {
  console.log("!-> handled error");
  console.log(err);
  // const { message = "Something went wrong", status = 500 } = err; //destructure msg and status from err, passed from next
  // res.status(status).send(message);
  // console.log(status, message);
  res.status(400).send({ err });
  // next(err);
});

app.listen(PORT, () => {
  console.log(`--> Mercury api listening on port ${PORT}`);
});
