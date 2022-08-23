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
} from "./utils/validation.js";
import { asyncErrorWrapper } from "./utils/asyncErrorWrapper.js";
import ExpressError from "./utils/ExpressError.js";
import storage from "./utils/cloudinary.js";
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

// app.use(express.urlencoded({ extended: true })); // ! <-- might not need this? bc multer
// app.use(express.json());

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

// app.use(cookieParser("testSecret"));
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

// ! replaced with cors module ^
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", DOMAIN);
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// app.get("/", (req, res) => {
//   res.send("polo");
// });

app.get("/clear", async (req, res) => {
  const chan = await Channel.deleteMany({});
  const grp = await Group.deleteMany({});
  console.log("!!! DELETED EVERYTHING");
  res.send(`${chan}, ${grp}`);
});

app.post(
  "/u",
  upload.none(),
  asyncErrorWrapper(async function (req, res) {
    const result = await User.findOne({ username: req.body.username });
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
      console.log("Successfully Authenticated");
      res.send({
        username: user.username,
        userImage: user.userImage.url,
        userImageSmall: user.userImage.thumbnailSmall,
        userImageMedium: user.userImage.thumbnailMedium,
      });
    });

    console.log(`  > new user "${req.body.username}" created`);
  })
);

app.patch("/u/:uid", upload.none(), function (req, res) {
  console.log("userdata");
  console.log(req.body);
  // console.log(req.user);
  res.send("useredit");
});

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

app.delete("/u", function (req, res) {
  console.log(`logged out ${req.user.username}`);
  req.logOut((err) => err);
  res.status(200).send("ok"); // ! Check that api is not sending unnecessary info like user hashed pw
}); // ? logout

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
  // ! associate creator with group
  "/g",
  upload.single("file"),
  validateGroup,
  validateImage,
  asyncErrorWrapper(async function (req, res) {
    console.log("authenticated?", req.isAuthenticated());
    if (req.isAuthenticated()) {
      console.log("user is making grop");

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

      console.log(newGroup);

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
    // const result = await Group.find({ members: req.user })
    //   .populate({
    //     path: "channels",
    //     populate: [
    //       { path: "text", model: "Channel" },
    //       { path: "task", model: "Channel" },
    //     ],
    //   })
    //   .populate({
    //     // ? selective populate
    //     path: "members",
    //     select: ["username", "userImage"],
    //     populate: { path: "userImage", select: "thumbnailSmall" }, // ! dun work
    //   });
    // res.sendStatus(500);
    // res.json(result);

    // function delay(time) {
    //   return new Promise((resolve) => setTimeout(resolve, time));
    // }

    // await delay(2000).then();
    console.count("sending get");
    // console.log(result[0].members);
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
  console.log("stack: ", err);
  res.sendStatus(status);
  // res.sendStatus(status).send(message);
  // res.status(400).send({ err });
});

app.listen(PORT, () => {
  console.log(`--> Mercury api listening on port ${PORT}`);
});
