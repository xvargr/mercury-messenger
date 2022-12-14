import { v2 as cloudinary } from "cloudinary";

import Group from "../models/Group.js";
import User from "../models/User.js";
import Channel from "../models/Channel.js";

// utils
import ExpressError from "../utils/ExpressError.js";
import socketSync from "../socket/socketSync.js";

export async function fetchGroups(req, res) {
  const result = await Group.find({ members: req.user }).populate([
    {
      path: "channels",
      populate: [
        { path: "text", model: "Channel" },
        { path: "task", model: "Channel" },
      ],
    },
    { path: "administrators", select: ["_id", "username"] },
    {
      path: "members",
      select: ["_id", "username", "userImage", "userColor"],
    },
  ]);

  const groupData = {};
  for (const group of result) {
    groupData[group._id] = group;
    groupData[group._id].chatData = {};
  }

  res.json(groupData);
}

export async function newGroup(req, res) {
  const newGroup = new Group({
    name: req.body.name.trim(),
    image: { url: req.file.path, filename: req.file.filename },
    channels: { text: [], task: [] },
    members: [],
    administrators: [],
  });

  const user = await User.findById(req.user.id);
  newGroup.administrators.push(user);
  newGroup.members.push(user);

  const newChannel = new Channel({
    name: "General",
    type: "text",
  });
  newGroup.channels.text.push(newChannel);

  await newChannel.save();
  await newGroup.save();

  socketSync.groupEmit({
    target: { type: "group", id: newGroup._id },
    change: { type: "create", data: newGroup },
    initiator: req.user,
  });

  res.status(201).json({
    newGroup: newGroup,
    messages: [{ message: "Successfully created new group", type: "success" }],
  });
}

export async function deleteGroup(req, res) {
  const id = req.params.gid;
  const group = await Group.findById(id).populate({
    path: "channels",
    populate: [
      { path: "text", model: "Channel" },
      { path: "task", model: "Channel" },
    ],
  });

  if (!group.administrators.some((admin) => admin._id.equals(req.user._id))) {
    throw new ExpressError("Forbidden", 403);
  }

  socketSync.groupEmit({
    target: { type: "group", id: group._id },
    change: { type: "delete", data: group },
    messages: [{ message: `Group "${group.name}" was deleted`, type: "alert" }],
    initiator: req.user,
  });

  await group.remove();

  res.json({
    messages: [{ message: "successfully deleted group", type: "success" }],
  });
}

export async function editGroup(req, res) {
  const id = req.params.gid;
  const { name } = req.body;
  const toKick = req.body.toKick?.split(","); // formData does not support objects or arrays, an alternative method to this it to JSON stringify and parse objects and arrays
  const toPromote = req.body.toPromote?.split(",");
  const file = req.file;
  let extra = {};

  const group = await Group.findById(id).populate([
    {
      path: "channels",
      populate: [
        { path: "text", model: "Channel" },
        { path: "task", model: "Channel" },
      ],
    },
    { path: "administrators", select: ["_id", "username"] },
    {
      path: "members",
      select: ["_id", "username", "userImage", "userColor"],
    },
  ]);

  if (name) group.name = name;

  if (toPromote) {
    extra.toPromote = [];
    for (let userId of toPromote) {
      const member = await User.findById(userId).select(["username"]).lean();
      group.administrators.push(member);
      extra.toPromote.push(userId);
    }
  }

  if (toKick) {
    extra.toKick = [];
    group.members = group.members.filter((member) => {
      if (toKick.includes(member.id)) {
        extra.toKick.push(member.id);
        return false;
      } else return true;
    });
  }

  if (file) {
    cloudinary.uploader.destroy(group.image.filename);
    group.image = { url: req.file.path, filename: req.file.filename };
  }

  await group.save();

  socketSync.groupEmit({
    target: { type: "group", id: group._id },
    change: { type: "edit", data: group, extra },
    messages: [
      { message: `Group "${group.name}" was modified`, type: "alert" },
    ],
    initiator: req.user,
  });

  res.json({
    group,
    messages: [{ message: "successfully edited group", type: "success" }],
  });
}

export async function joinWithCode(req, res) {
  const group = await Group.findById(req.params.gid).populate({
    path: "members",
    select: "username",
  });
  if (!group) throw new ExpressError("Cannot find group", 400);

  const user = await User.findById(req.user._id)
    .select(["_id", "username", "userImage", "userColor"])
    .lean();
  if (!user) throw new ExpressError("User account error", 400);

  if (group.members.some((member) => member._id.equals(user._id)))
    throw new ExpressError("you are already a member", 400);

  group.members.push(user);
  await group.save();

  await group.populate([
    {
      path: "channels",
      populate: [
        { path: "text", model: "Channel" },
        { path: "task", model: "Channel" },
      ],
    },
    { path: "administrators", select: ["_id", "username"] },
    {
      path: "members",
      select: ["_id", "username", "userImage", "userColor"],
    },
  ]);

  const initData = await socketSync.groupEmit({
    target: { type: "group", id: group._id },
    change: { type: "join", data: group, extra: { user } },
    messages: [
      { message: `${user.username} joined "${group.name}"`, type: "alert" },
    ],
    initiator: req.user,
  });

  res.status(200).json({
    chatData: initData.chatData,
    peerData: initData.peerData,
    joinedGroup: group,
    messages: [{ message: "successfully joined channel", type: "success" }],
  });
}

export async function groupRemoveUser(req, res) {
  const group = await Group.findById(req.params.gid)
    .populate({
      path: "members",
      select: ["username", "id"],
    })
    .populate({
      path: "channels",
      populate: ["text", "task"],
    });

  // is user in group? else abort
  const memberIndex = group.members.findIndex((member) =>
    member._id.equals(req.user._id)
  );
  if (memberIndex < 0) {
    throw new ExpressError("Invalid request", 400);
  }

  // is user an admin?
  const adminIndex = group.administrators.findIndex((admin) =>
    admin._id.equals(req.user._id)
  );

  // last admin can't leave
  if (
    adminIndex >= 0 && // is admin
    group.administrators.length === 1 && // is last admin
    group.members.length > 1 // is not last member
  )
    throw new ExpressError("Can't leave as the last administrator", 400);
  if (adminIndex >= 0) group.administrators.splice(adminIndex, 1);

  // remove user from members arr
  group.members.splice(memberIndex, 1);

  await group.save();

  socketSync.groupEmit({
    target: { type: "group", id: group._id },
    change: { type: "leave", data: group, extra: { userId: req.user.id } },
    messages: [
      { message: `${req.user.username} left ${group.name}`, type: "alert" },
    ],
    initiator: req.user,
  });

  res.json({
    messages: [{ message: "successfully left group", type: "success" }],
  });
}
