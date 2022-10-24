import Group from "../models/Group.js";
import Channel from "../models/Channel.js";

import ExpressError from "../utils/ExpressError.js";

export async function newChannel(req, res) {
  const parentGroup = await Group.findById({ _id: req.body.group });
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

  res.status(201).json({
    newChannel,
    messages: [
      { message: "Successfully created new channel", type: "success" },
    ],
  });
}

export async function editChannel(req, res) {
  const channel = await Channel.findById(req.params.cid);
  const group = await Group.findOne({
    "channels.text": { _id: channel._id },
  }).populate({
    path: "administrators",
    select: ["_id", "id", "username"],
  });

  // check if user is admin
  if (!group.administrators.some((admin) => admin._id.equals(req.user._id))) {
    throw new ExpressError("Forbidden", 403);
  }

  if (req.body.name.length < 3) {
    throw new ExpressError("Channel name must be 3 characters or more", 400);
  }
  channel.name = req.body.name.substring(0, 20); // limit20char
  await channel.save();

  res.json({
    channelData: channel,
    messages: [{ message: "Successfully edited channel", type: "success" }],
  });
}

export async function deleteChannel(req, res) {
  const channel = await Channel.findById(req.params.cid);
  const parentGroup = await Group.findOne({
    "channels.text": channel,
  }).populate({
    path: "channels",
    populate: [
      { path: "text", model: "Channel" },
      { path: "task", model: "Channel" },
    ],
  });
  // check if channel exist in group, and group found
  if (!channel) throw new ExpressError("Channel not found", 500);
  if (!parentGroup) throw new ExpressError("Group not found", 500);

  // remove channel from parent
  const chIndex = parentGroup.channels.text.findIndex(
    (channel) => channel.id === req.params.cid
  );
  if (chIndex < 0) throw new ExpressError("Channel not found in group", 500);
  parentGroup.channels.text.splice(chIndex, 1);

  await parentGroup.save();
  channel.remove();

  res.json({
    groupData: parentGroup,
    messages: [{ message: "Successfully deleted channel", type: "success" }],
  });
}
