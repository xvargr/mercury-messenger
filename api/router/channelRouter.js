import express from "express";
import multer from "multer";
// utils
import { storage } from "../utils/cloudinary.js";
import asyncErrorWrapper from "../utils/asyncErrorWrapper.js";
import isLoggedIn from "../utils/isLoggedIn.js";
import { validateChannel } from "../utils/validation.js";
// controller
import {
  newChannel,
  editChannel,
  deleteChannel,
} from "../controller/channelController.js";

const router = express.Router();
const upload = multer({ storage }); // multer parses multiform data and set storage to cloudinary

router.post(
  "/",
  isLoggedIn,
  upload.none(),
  validateChannel,
  asyncErrorWrapper(newChannel)
);

router
  .route("/:cid")
  .patch(
    isLoggedIn,
    upload.none(),
    validateChannel,
    asyncErrorWrapper(editChannel)
  )
  .delete(isLoggedIn, asyncErrorWrapper(deleteChannel));

export default router;
