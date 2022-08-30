import Group from "../models/Group.js";
import User from "../models/User.js";
import Channel from "../models/Channel.js";

import ExpressError from "../utils/ExpressError.js";

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
      select: ["_id", "username", "userImage"],
    },
  ]);
  // console.count("sending get");
  res.json(result);
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

  console.log(newGroup);

  await newChannel.save();
  await newGroup.save();

  res.status(201).send(`successfully created "${req.body.name}"`);
}

export async function deleteGroup(req, res) {
  const id = req.params.gid;
  const group = await Group.findById(id);

  if (!group.administrators.some((admin) => admin._id.equals(req.user._id)))
    throw new ExpressError("Not authorized", 401);

  await group.remove();

  console.log(`i-> ${group.name} group deleted`);
  res.send("ok");
}

export async function joinWithCode(req, res) {
  const group = await Group.findById(req.params.gid).populate({
    path: "members",
    select: "username",
  });
  if (!group) throw new ExpressError("Invalid invite code", 400);

  const user = await User.findById(req.user._id).lean();
  if (!user) throw new ExpressError("User account error", 400);
  // console.log(user);

  if (group.members.some((member) => member._id.equals(user._id)))
    throw new ExpressError("you are already a member", 400);

  group.members.push(user);
  await group.save();

  res.status(200).send("ok");
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

  // delete group if no members left
  if (group.members.length === 0) {
    await group.remove();
  } else {
    await group.save();
  }

  res.send("ok");
}
