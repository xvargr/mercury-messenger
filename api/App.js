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
import Group from "./models/Group.js";
import Channel from "./models/Channel.js";
import Message from "./models/Message.js";
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
  // console.log("connection request");
  if (socket.request.isAuthenticated()) {
    // console.log("Authenticated!");
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
  console.log(
    "user connected, ID:",
    socket.id,
    " username: ",
    socket.request.user.username
  );
  // todo reject if user already has a connection

  // find sender and their groups in database
  const sender = await User.findById(socket.request.user.id).lean();
  const userGroups = await Group.find({ members: sender }).populate({
    path: "channels.text",
  });

  // assign them to all rooms based on groups and channels
  for (const group of userGroups) {
    socket.join(`g:${group.id}`);
    group.channels.text.forEach((channel) => socket.join(`c:${channel.id}`));
    // for (const channel of group.channels.text) {
    //   socket.join(`c:${channel.id}`);
    // }
  }

  // socket.on("test", function (testData) {
  //   console.log(`${sender.username} said ${testData.content.text}`);
  //   const { group, channel } = testData.target;
  //   socket.to(`c:${channel}`).emit("message", testData); // send to everyone except sender
  //   socket.emit("sent", "message sent"); // send only to sender
  //   // socket.nsp.to(socket.id).emit("message", testData); // nsp namespace? emits to all in room
  //   // socket.to(socket.id).emit("message", testData); // emit to everyone else in room
  //   // socket.emit("message", testData); // emit to all?
  //   // socket.to("bruh").emit("message", testData);
  // });

  socket.on("newCluster", async function (clusterData, callback) {
    // console.log("newCluster");

    // console.log(clusterData);
    // {
    //   senderId: '63159a6ba9e06553f3cfbe68',
    //   target: {
    //     group: '631b1dd6064661b6261e19c5',
    //     channel: '631f36cf41f56c86a61c23b6'
    //   },
    //   content: {
    //     mentions: null,
    //     text: 'aaa',
    //     file: null,
    //     dateString: '2022-09-16T20:47:26+08:00',
    //     timestamp: 1663332446016
    //   }
    // }

    const channel = await Channel.findById(clusterData.target.channel);
    const group = await Group.findById(clusterData.target.group);

    console.log(
      `NEW: ${sender.username} said ${clusterData.content.text} in channel ${channel.name} in group ${group.name}`
    );

    // TODO validate, save to db, add unread to users?? or g or c ??

    // setTimeout(() => {
    //   socket.emit("sent", "message sent"); // send only to sender
    // }, 5000);

    const newMessageCluster = new Message({
      sender,
      channel,
      group,
      content: [clusterData.content],
    });

    // await newMessageCluster.save();

    const populatedCluster = await newMessageCluster.populate([
      {
        path: "sender",
        select: ["username"],
        populate: { path: "userImage" },
      },
      { path: "group", select: ["name"] },
    ]);
    // .populate({ path: "group", select: ["name"] });

    // console.log(populatedCluster.group);

    // console.log(lol.sender);
    // console.log(lol);

    // const msgClust = {
    //   _id: { $oid: "632b320325afd88123a24b39" },
    //   sender: { $oid: "630dca30f1a396987de878c9" },
    //   channel: { $oid: "6329cdd5e3e4b612ebd2f6ef" },
    //   content: [
    //     {
    //       mentions: null,
    //       text: "aaa",
    //       file: null,
    //       dateString: "2022-09-21T23:47:15+08:00",
    //       timestamp: { $numberDouble: "1.6637752356110E+12" },
    //       _id: { $oid: "632b320325afd88123a24b3a" },
    //     },
    //   ],
    //   __v: { $numberInt: "0" },
    // };

    // newMessageCluster.content[0].seen = [sender];

    // // console.log(newMessageCluster);
    // console.log("newMessageCluster");

    // // console.log(moment(message.timestamp).add(3, "days").fromNow());
    // // console.log("MESSAGE RECEIVED");
    // // console.log(message);
    // // console.log(message.timestamp.getFullYear());
    // // ? emit sends to all, broadcast sends to everyone except sender

    // io.to(`c:${clusterData.target.channel}`).emit("message", populatedCluster);
    io.emit("message", populatedCluster);
    setTimeout(() => {
      callback(populatedCluster);
    }, 1000);
  });

  socket.on("appendCluster", async function (clusterData) {
    console.log("appendCluster");

    // todo find the doc and update its contents

    // console.log(clusterData);

    // const channel = await Channel.findById(clusterData.target.channel);
    // const group = await Group.findById(clusterData.target.group);

    // console.log(
    //   `APPEND: ${sender.username} appended ${clusterData.content.text} in channel ${channel.name} in group ${group.name}`
    // );
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
