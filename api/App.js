// modules
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import passport from "./utils/passportDefine.js";
import MongoStore from "connect-mongo";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import moment from "moment";

// models
import User from "./models/User.js";
// middleware
import ExpressError from "./utils/ExpressError.js";
// routers
import userRouter from "./router/userRouter.js";
import groupRouter from "./router/groupRouter.js";
import channelRouter from "./router/channelRouter.js";

// global vars reassignments, env variables
const app = express();
const API_PORT = 3100;
// const SIO_PORT = 3200;
const DOMAIN = process.env.APP_DOMAIN;
const httpServer = createServer(app); // create a server for express, need this to reuse server instance for socket.io
const io = new Server(httpServer, {
  cors: {
    origin: DOMAIN,
    credentials: true,
  },
  serveClient: false,
}); // pass the created server to socket

// mongoDB connection
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

const sessionSettings = session({
  secret: process.env.SECRET,
  resave: false, // force resave if not changed
  maxAge: 2.592e8, // 3 days
  saveUninitialized: false, // save new but unmodified
  store: MongoStore.create({
    // mongoUrl: process.env.ATLAS_URL,
    clientPromise: mongoClient,
    touchAfter: 24 * 3600,
    crypto: { secret: process.env.SECRET },
  }),
});

app.use(sessionSettings);
app.use(passport.initialize()); // set up the functions to serialize/deserialize the user data from the request
app.use(passport.session()); // change the 'user' value that is currently the session id (from the client cookie) into the true deserialized user object.

passport.serializeUser((user, done) => done(null, user.id)); // stores a cookie with the user's id
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
}); // find cookie's user id and match from db

// path router
app.use("/u", userRouter);
app.use("/g", groupRouter);
app.use("/c", channelRouter);

// socket.io middleware
const wrap = (middleware) => (socket, next) => {
  middleware(socket.request, {}, next);
}; // wrapper function for socket.io, to enable the use of express middleware

io.use(wrap(sessionSettings));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// socket auth middleware
io.use(async function (socket, next) {
  if (socket.request.isAuthenticated()) {
    console.log("Authenticated!");
    next();
  } else {
    const err = new ExpressError("Unauthorized", 401);
    console.log("Reject");
    next(err); // refuse connection
  }
});

// ? notify last message, use latest timestamp compare on user model?

// socket.io events
io.on("connection", async function (socket) {
  console.log("user connected, ID:", socket.id);
  console.log("user connected, username:", socket.request.user.username);

  // ! only select necessary fields, not sensitive ones
  const sender = await User.findById(socket.request.user.id).lean();
  console.log(sender);

  socket.on("newMessageCluster", async function (messageData) {
    console.log("newCluster");
    console.log(messageData);
    // console.log(`${socket.id} said ${message.text}`);

    // const channel = await Channel.find() // todo waiting for context restructure

    const messageCluster = {
      sender,
      channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
      content: [
        {
          mentions: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          text: { type: String, trim: true },
          file: { type: String },
          dateString: { type: String, required: true },
          timestamp: { type: Number, required: true },
        },
        {
          toObject: { virtuals: true },
          toJSON: { virtuals: true },
        },
      ],
    };

    // console.log(moment(message.timestamp).add(3, "days").fromNow());
    // console.log("MESSAGE RECEIVED");
    // console.log(message);
    // console.log(message.timestamp.getFullYear());
    // ? emit sends to all, broadcast sends to everyone except sender
    io.emit("message", messageData);
  });

  socket.on("pushMessageCluster", function (message) {
    // console.log(`${socket.id} push ${message.text}`);
    console.log("push");
    console.log(message);

    io.emit("message", message);
  });

  // todo socket on append

  // todo save to db

  // ? fetch from to db (on connection?)

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

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
  res.status(status).json({
    messages: [{ message, type: "error" }],
  });
});

// app.listen(API_PORT, () => {
//   console.log(`--> Mercury api listening on port ${API_PORT}`);
// }); // this is express' server, below we created our own with both express and socket on it
httpServer.listen(API_PORT, () =>
  console.log(`--> Mercury api listening on port ${API_PORT}`)
);
