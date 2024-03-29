import express from "express";
import multer from "multer";

import { storage } from "../utils/cloudinary.js";
import isLoggedIn from "../utils/isLoggedIn.js";
import asyncErrorWrapper from "../utils/asyncErrorWrapper.js";
import { validateUser, validateUserEdit } from "../utils/validation.js";

import {
  deleteUser,
  editUser,
  logInUser,
  logOutUser,
  newUser,
} from "../controller/userController.js";

const upload = multer({ storage });
const router = express.Router();

router
  .route("/")
  .post(upload.none(), validateUser, asyncErrorWrapper(newUser))
  .delete(isLoggedIn, logOutUser);

router.post("/login", upload.none(), logInUser);

router
  .route("/:uid")
  .patch(
    isLoggedIn,
    upload.single("file"),
    validateUserEdit,
    asyncErrorWrapper(editUser)
  )
  .put(upload.none(), isLoggedIn, asyncErrorWrapper(deleteUser));

export default router;
