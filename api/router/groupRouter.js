import express from "express";
import multer from "multer";
// utils
import storage from "../utils/cloudinary.js";
import isLoggedIn from "../utils/isLoggedIn.js";
import asyncErrorWrapper from "../utils/asyncErrorWrapper.js";
import {
  validateGroup,
  validateGroupEdit,
  validateImage,
} from "../utils/validation.js";
// controller
import {
  deleteGroup,
  fetchGroups,
  groupRemoveUser,
  joinWithCode,
  newGroup,
  editGroup,
} from "../controller/groupController.js";

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(isLoggedIn, asyncErrorWrapper(fetchGroups))
  .post(
    isLoggedIn,
    upload.single("file"),
    validateGroup,
    validateImage,
    asyncErrorWrapper(newGroup)
  );

router.post("/:gid/join", isLoggedIn, asyncErrorWrapper(joinWithCode));

router
  .route("/:gid")
  .put(
    isLoggedIn,
    upload.single("file"),
    validateGroupEdit,
    asyncErrorWrapper(editGroup)
  )
  .patch(isLoggedIn, asyncErrorWrapper(groupRemoveUser))
  .delete(isLoggedIn, asyncErrorWrapper(deleteGroup));

export default router;
