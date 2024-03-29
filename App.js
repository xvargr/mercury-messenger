// modules
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import MongoStore from "connect-mongo";
import session from "express-session";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

// utils
import passport from "./utils/passportDefine.js";
import socketInstance from "./socket/socket.js";

// models
import User from "./models/User.js";

// middleware
import ExpressError from "./utils/ExpressError.js";

// routers
import userRouter from "./router/userRouter.js";
import groupRouter from "./router/groupRouter.js";
import channelRouter from "./router/channelRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// global vars reassignments, instances, env variables
const app = express();
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const PORT = process.env.PORT;
const httpServer = createServer(app); // create a server for express, need this to reuse server instance for socket.io

socketInstance.connectServer(httpServer); // pass the created server to socket

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
    origin: `${DOMAIN_NAME}:${PORT}`,
    optionsSuccessStatus: 200,
    credentials: true,
    preflightContinue: true,
  })
);
app.set("trust proxy", true); // for passing IP addresses if express is behind a reverse proxy

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

// serve react app
app.use(express.static(`${__dirname}/client/build`));
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/client/build`);
});

// path router
app.use("/u", userRouter);
app.use("/g", groupRouter);
app.use("/c", channelRouter);

// health check path
app.get(
  "/health",
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
    credentials: false,
  }),
  (req, res) => {
    res.status(200).send("Ok");
  }
);

// socket.io middleware
const wrap = (middleware) => (socket, next) => {
  middleware(socket.request, {}, next);
}; // wrapper function for socket.io, to enable the use of express middleware

// wraps passport middleware, gives access to passport user object in socket connections for authentication
socketInstance.io.use(wrap(sessionSettings));
socketInstance.io.use(wrap(passport.initialize()));
socketInstance.io.use(wrap(passport.session()));

// initialize socket events
socketInstance.initialize();

// 404 catch
app.all("*", function (req, res, next) {
  console.log("!-> 404 triggered");
  next(new ExpressError("Page Not Found", 404));
});

// Custom Error Handler
app.use(function (err, req, res, next) {
  console.log("!-> handled error");
  const {
    message = "Something went wrong",
    status = 500,
    respond = true,
  } = err;
  console.log(status, message);
  console.log("stack: ", err);
  if (respond) {
    // console.log("SENDING BACK ERR");
    res.status(status).json({
      messages: [{ message, type: "error" }],
    });
  }
});

// app.listen(API_PORT, () => {
//   console.log(`--> Mercury api listening on port ${API_PORT}`);
// }); // this is express' server, below we created our own with both express and socket on it

httpServer.listen(PORT, () =>
  console.log(`--> Mercury api listening on port ${PORT} of ${DOMAIN_NAME}`)
);
