import express from "express";
import multer from "multer";
// utils
import storage from "../utils/cloudinary.js";
import isLoggedIn from "../utils/isLoggedIn.js";
import asyncErrorWrapper from "../utils/asyncErrorWrapper.js";
import { validateGroup, validateImage } from "../utils/validation.js";
// controller
import {
  deleteGroup,
  fetchGroups,
  groupRemoveUser,
  joinWithCode,
  newGroup,
} from "../controller/groupController.js";

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(isLoggedIn, asyncErrorWrapper(fetchGroups))
  .post(
    upload.single("file"),
    isLoggedIn,
    validateGroup,
    validateImage,
    asyncErrorWrapper(newGroup)
  );

router.post("/:gid/join", isLoggedIn, asyncErrorWrapper(joinWithCode));

// remove member from group
router
  .route("/:gid")
  .patch(isLoggedIn, asyncErrorWrapper(groupRemoveUser))
  .delete(isLoggedIn, asyncErrorWrapper(deleteGroup));

// router.patch("/:gid", );

export default router;
