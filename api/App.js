// dependencies
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import passport from "./utils/passportDefine.js";
import MongoStore from "connect-mongo";
import session from "express-session";
// models
import Group from "./models/Group.js";
import Channel from "./models/Channel.js";
import User from "./models/User.js";
// middleware
import { validateChannel } from "./utils/validation.js";
import asyncErrorWrapper from "./utils/asyncErrorWrapper.js";
import ExpressError from "./utils/ExpressError.js";
import storage from "./utils/cloudinary.js";
import isLoggedIn from "./utils/isLoggedIn.js";
// controllers

// routers
import userRouter from "./router/userRouter.js";
import groupRouter from "./router/groupRouter.js";

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

passport.serializeUser((user, done) => done(null, user.id)); // stores a cookie with the user's id
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
}); // find cookie's user id and match from db

app.use("/u", userRouter);
app.use("/g", groupRouter);

// todo check uniqueness of channel name
// todo check if authorized
// todo move /c to router and controller file
app.post(
  "/c",
  isLoggedIn,
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

app.delete("/c/:cid");

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
