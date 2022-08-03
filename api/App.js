const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const PORT = 3100;
const DOMAIN = "http://localhost:3000";

// websocket.io //database
// mongoose // mongodb

// "dependencies": {
//     "cloudinary": "^1.30.0",
//     "connect-flash": "^0.1.1",
//     "connect-mongo": "^4.6.0", // for sessions store
//     "cookie-parser": "^1.4.6",
//     "dotenv": "^16.0.1", // read .env
//     "express-mongo-sanitize": "^2.2.0", // sanitize html
//     "express-session": "^1.17.3", // sessions
//     "helmet": "^5.1.0", // security
//     "joi": "^17.6.0", // backend validation
//     "mongoose": "^6.3.2",
//     "multer": "^1.4.5-lts.1", // multipart form data??
//     "multer-storage-cloudinary": "^4.0.0", // multer to cloudinary upload
//     "passport": "^0.6.0", // user auth
//     "passport-local": "^1.0.0",
//     "passport-local-mongoose": "^7.1.2",
//     "sanitize-html": "^2.7.0"

// todo: connect to mongodb and image hosting, implement auth
// * decide if using mongo driver or mongoose
// * look into if joi is necessary
// * probably can't use passport for backend auth??

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

// * need routes for /g /c new, /chats post get??

app.get("/", (req, res) => {
  console.log("GET REQUEST");
  res.send("polo");
});

app.post("/g", (req, res) => {
  console.log("POST => GROUPS");
  console.log(req.body);
  console.log(req.files);
  res.send(`POST => /g => ${req.body.name}`);
});

app.post("/c", (req, res) => {
  console.log("POST => CHANNELS");
  console.log(req.body);
  res.send(`POST => /c => ${req.body.name}`);
});

app.listen(PORT, () => {
  console.log(`Mercury api listening on port ${PORT}`);
});
