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
// import moment from "moment";

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

// global vars reassignments, instances, env variables
const app = express();
const API_PORT = 3100;
// const SIO_PORT = 3200;
const DOMAIN = process.env.APP_DOMAIN;
const httpServer = createServer(app); // create a server for express, need this to reuse server instance for socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [DOMAIN, "http://192.168.0.237:3000"],
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
    origin: [DOMAIN, "http://192.168.0.237:3000"],
    optionsSuccessStatus: 200,
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

// currently connected users via socket.io, used to prevent multiple connections
// const socketUsers = [] // todo

// socket.io middleware
const wrap = (middleware) => (socket, next) => {
  middleware(socket.request, {}, next);
}; // wrapper function for socket.io, to enable the use of express middleware

// wraps passport middleware, gives access to passport user object in socket connections
io.use(wrap(sessionSettings));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// socket auth middleware
io.use(async function (socket, next) {
  if (socket.request.isAuthenticated()) {
    next();
  } else {
    const err = new ExpressError("Unauthorized", 401);
    next(err); // refuse connection
  }
});

// ? notify last message, use latest timestamp compare on user model?

// todo one login at a time

// socket.io events
io.on("connection", async function (socket) {
  console.log(
    "user connected, ID:",
    socket.id,
    " username: ",
    socket.request.user.username
  );
  // todo reject if user already has a connection

  // todo add socket to room on new create

  // ! todo broadcast changes to group and channels

  const sender = await User.findById(socket.request.user.id).lean();

  async function constructChatData(user) {
    // find sender and their groups in database
    const userGroups = await Group.find({ members: user }).populate({
      path: "channels.text",
    });

    const chatData = {};

    // forEach is not async friendly, use for of
    for (const group of userGroups) {
      socket.join(`g:${group.id}`);
      chatData[group.id] = {};
      for (const channel of group.channels.text) {
        socket.join(`c:${channel.id}`);
        chatData[group.id][channel.id] = [];

        const clusters = await Message.find({ channel })
          .sort({
            clusterTimestamp: "desc",
          })
          .populate({ path: "sender", select: ["userImage", "username"] })
          .limit(20);

        for (const cluster of await clusters) {
          chatData[group.id][channel.id].unshift(cluster);
        }
      }
    }

    return chatData;
  }

  const initData = await constructChatData(sender);

  // ! todo on new channel update chatData
  socket.emit("initialize", initData);

  let n = 0;
  socket.on("newCluster", async function (clusterData, callback) {
    console.log("received new message request");
    if (n % 2 === 0) {
      n++;
      return;
    }

    const channel = await Channel.findById(clusterData.target.channel);
    const group = await Group.findById(clusterData.target.group);

    const newMessageCluster = new Message({
      sender,
      channel,
      group,
      content: [clusterData.data],
    });

    await newMessageCluster.save();

    const populatedCluster = await newMessageCluster.populate([
      {
        path: "sender",
        select: ["username"],
        populate: { path: "userImage" },
      },
      { path: "group", select: ["name"] },
      { path: "content" },
    ]);

    socket
      // .to(`c:${populatedCluster.channel._id}`)
      .to(`c:${clusterData.target.channel}`)
      .emit("newMessage", populatedCluster); // sender still gets message // solution, use socket, not io to emit

    // artificial delay for testing asynchronous appends
    // setTimeout(async () => {
    //   await newMessageCluster.save();
    //   callback({
    //     target: clusterData.target,
    //     data: populatedCluster,
    //   });
    // }, 5000);

    callback({
      target: clusterData.target,
      data: populatedCluster,
    });
  });

  socket.on("appendCluster", async function (clusterData, callback) {
    console.log(`received append request of index ${clusterData.target.index}`);
    if (n % 2 === 0) {
      n++;
      return;
    }

    async function findParent(arg) {
      let result;
      if (arg.target.cluster.id) {
        result = await Message.findById(arg.target.cluster.id);
      } else if (arg.target.cluster.timestamp) {
        result = await Message.findOne({
          clusterTimestamp: arg.target.cluster.timestamp,
        });
      } else {
        throw new Error("an id or timestamp is required");
      }

      // if (result) {
      //   if (result.__v === arg.target.index - 1) {
      //     console.log("accepting");
      //     return result;
      //   } else {
      //     console.log("rejecting");
      //     return null;
      //   }
      // }

      if (result?.__v === arg.target.index - 1) return result;
      else return null;
    }

    let parentCluster = await findParent(clusterData, true);

    // let retries = 1
    // while (!parentCluster && retries <= 3) {

    //   retries++
    // }

    // async wait for parentCluster to save
    if (!parentCluster) {
      let retries = 0;
      const waitForParent = setInterval(async () => {
        parentCluster = await findParent(clusterData, true);
        if (parentCluster) {
          console.log(parentCluster.__v);
          clearInterval(waitForParent);
          parentCluster.append(clusterData);
          socket.to(`c:${parentCluster.channel}`).emit("appendMessage", {
            target: {
              ...clusterData.target,
              cluster: {
                timestamp: clusterData.target.cluster.timestamp,
                id: parentCluster._id,
              },
            },
            data: parentCluster.content[clusterData.target.index],
          }); // sender still gets message // solution, use socket, not io to emit
          console.log(
            `append request of index ${clusterData.target.index} saved after ${retries} retries`
          );
          callback({
            target: {
              ...clusterData.target,
              cluster: {
                timestamp: clusterData.target.cluster.timestamp,
                id: parentCluster._id,
              },
            },
            data: parentCluster.content[clusterData.target.index],
          });
        }

        retries++;
        if (retries >= 3) {
          console.log(
            `append request of index ${clusterData.target.index} failed to save`
          );

          clearInterval(waitForParent);
          callback({
            failed: clusterData.content.timestamp,
            target: {
              ...clusterData.target,
              // cluster: { id: parentCluster._id }, // if made it here then parentCluster is null
            },
          });
        }
      }, 2000);
      // } else if (parentCluster.__v !== clusterData.target.index) {
    } else {
      console.log(
        `append request of index ${clusterData.target.index} saved on first try`
      );

      console.log(parentCluster.__v);

      // if (parentCluster.__v !== clusterData.target.index) {

      // }

      // while (parentCluster.__v !== clusterData.target.index) {
      //   console.log("index does not match, waiting")
      //   setTimeout(async () => {

      //     parentCluster = await findParent(clusterData);
      //   }, 750);
      // }

      parentCluster.append(clusterData);

      console.log(parentCluster.__v);

      socket.to(`c:${parentCluster.channel}`).emit("appendMessage", {
        target: {
          ...clusterData.target,
          cluster: {
            timestamp: clusterData.target.cluster.timestamp,
            id: parentCluster._id,
          },
        },
        data: parentCluster.content[clusterData.target.index],
      }); // sender still gets message // solution, use socket, not io to emit
      callback({
        target: {
          ...clusterData.target,
          cluster: { id: parentCluster._id },
        },
        data: parentCluster.content[clusterData.target.index],
      });
    }
  });

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
