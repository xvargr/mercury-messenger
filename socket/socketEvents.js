import { uploadFromBuffer } from "../utils/cloudinary.js";

import socketUsers from "./socketUser.js";
import socketSync from "./socketSync.js";

// models
import Group from "../models/Group.js";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";

// const
const NUM_TO_LOAD = 20;

export async function constructInitData(args) {
  // find sender and their groups in database
  const { socket, sender, single } = args;

  let userGroups;
  if (single) {
    userGroups = [
      await Group.findById(single).populate({
        path: "channels.text",
      }),
    ];
  } else {
    userGroups = await Group.find({ members: sender }).populate({
      path: "channels.text",
    });
  }

  // join rooms of each channel and group associated with
  // forEach is not async friendly, use for of
  const chatData = {};
  const peerData = {
    [sender._id]: { status: sender.forcedStatus ?? "online" },
  };
  const chatDepleted = {};

  socket.join(`s:${sender._id}`); // join own status room

  for (const group of userGroups) {
    if (!single) socket.join(`g:${group.id}`); // join group room
    chatData[group.id] = {};
    chatDepleted[group.id] = {};

    for (const channel of group.channels.text) {
      if (!single) socket.join(`c:${channel.id}`); // join channel room
      chatData[group.id][channel.id] = [];

      const clusters = await Message.find({ channel })
        .sort({
          clusterTimestamp: "desc",
        })
        .select(["dateString", "timestamp", "clusterTimestamp"])
        .populate({
          path: "sender",
          select: ["userImage", "username", "userColor"],
        })
        .populate({
          path: "content",
          populate: { path: "mentions", select: "username", model: "User" },
        })
        .populate({
          path: "reply",
          select: ["content"],
          populate: [{ path: "sender", select: "username", model: "User" }],
        })
        .limit(NUM_TO_LOAD + 1);

      // the extra 1 document is used to check if there are at least 1 more document after the ones that were sent
      if (clusters.length < NUM_TO_LOAD + 1) {
        chatDepleted[group.id][channel.id] = true;
      } else if (clusters.length === NUM_TO_LOAD + 1) {
        clusters.splice(clusters.length - 1, 1);
      }

      for (const cluster of await clusters) {
        chatData[group.id][channel.id].unshift(cluster);
      }
    }

    // get related user's status and joins their status rooms
    for (const member of group.members) {
      if (!single) socket.join(`s:${member._id}`); // join member status rooms
      peerData[member._id] = { status: socketUsers.getStatus(member._id) };
    }
  }

  return { chatData, peerData, chatDepleted };
}

export async function sendInitData(args) {
  const { socket, sender, callback } = args;

  const initData = await constructInitData({ socket, sender });

  callback(initData);
}

export async function newCluster(args) {
  const { socket, sender, clusterData, callback } = args;
  const file = clusterData.data.file;

  const channel = await Channel.findById(clusterData.target.channel);
  const group = await Group.findById(clusterData.target.group);

  const messageContent = {
    mentions: [...clusterData.data.mentions],
    text: clusterData.data.text,
    file: null,
    dateString: clusterData.data.dateString,
    timestamp: clusterData.data.timestamp,
  };

  // file upload
  if (file) {
    const imageData = await uploadFromBuffer(file);

    messageContent.file = {
      filename: imageData.public_id,
      url: imageData.secure_url,
    };
  }

  const newMessageCluster = new Message({
    sender,
    channel,
    group,
    content: [messageContent],
    reply: clusterData.data.reply || null,
  });

  await newMessageCluster.save();

  const populatedCluster = await newMessageCluster.populate([
    {
      path: "sender",
      select: ["username", "userColor"],
      populate: { path: "userImage" },
    },
    { path: "group", select: ["name"] },
    {
      path: "content",
      populate: { path: "mentions", select: "username", model: "User" },
    },
    {
      path: "reply",
      select: ["content"],
      populate: [{ path: "sender", select: "username", model: "User" }],
    },
  ]);

  socket
    .to(`c:${clusterData.target.channel}`)
    .emit("newMessage", populatedCluster); // sender still gets message // solution, use socket, not io to emit

  callback({
    target: clusterData.target,
    data: populatedCluster,
  });
}

export async function appendCluster(args) {
  const { socket, clusterData, callback } = args;
  const file = clusterData.content.file;

  const messageContent = {
    mentions: [...clusterData.content.mentions],
    text: clusterData.content.text,
    file: null,
    dateString: clusterData.content.dateString,
    timestamp: clusterData.content.timestamp,
  };

  if (file) {
    const imageData = await uploadFromBuffer(file);

    messageContent.file = {
      filename: imageData.public_id,
      url: imageData.url,
    };
  }

  async function appendAndEmit() {
    parentCluster.append({
      content: messageContent,
      target: clusterData.target,
    });

    const populatedCluster = await parentCluster.populate([
      {
        path: "sender",
        select: ["username", "userColor"],
        populate: { path: "userImage" },
      },
      { path: "group", select: ["name"] },
      {
        path: "content",
        populate: { path: "mentions", select: "username", model: "User" },
      },
    ]);

    socket.to(`c:${parentCluster.channel}`).emit("appendMessage", {
      target: {
        ...clusterData.target,
        cluster: {
          timestamp: clusterData.target.cluster.timestamp,
          id: parentCluster._id,
        },
      },
      data: populatedCluster.content[clusterData.target.index],
    }); // sender still gets message // solution, use socket, not io to emit

    callback({
      target: {
        ...clusterData.target,
        cluster: { id: parentCluster._id },
      },
      // data: messageContent,
      data: populatedCluster.content[clusterData.target.index],
    });
  }

  async function findParent(arg) {
    let result;
    if (arg.target.cluster.id) {
      result = await Message.findById(arg.target.cluster.id);
    } else if (arg.target.cluster.timestamp) {
      result = await Message.findOne({
        clusterTimestamp: arg.target.cluster.timestamp,
      });
    } else {
      throw new Error("an id or timestamp is required");
    }

    // this checks that in race conditions, edits will save in sequence and do not overwrite each other or save simultaneously
    if (result?.__v === arg.target.index - 1) return result;
    else return null;
  }

  function waitForParent() {
    let retries = 0;

    const retryInterval = setInterval(async () => {
      parentCluster = await findParent(clusterData, true);

      if (parentCluster) {
        clearInterval(retryInterval);
        appendAndEmit();
      }

      retries++;
      if (retries >= 3) {
        clearInterval(retryInterval);
        callback({
          failed: clusterData.content.timestamp,
          target: {
            ...clusterData.target,
          },
        });
      }
    }, 2000);
  }

  let parentCluster = await findParent(clusterData, true);

  // async wait for parentCluster to save
  if (!parentCluster) waitForParent();
  else appendAndEmit();
}

export async function fetchMoreMessages(args) {
  const { fetchParams, callback } = args;

  let depleted = false;
  const partialChat = [];

  const clusters = await Message.find({
    channel: fetchParams.target.channel,
    clusterTimestamp: { $lt: fetchParams.last },
  })
    .sort({
      clusterTimestamp: "desc",
    })
    .select(["dateString", "timestamp", "clusterTimestamp"])
    .populate({
      path: "sender",
      select: ["userImage", "username", "userColor"],
    })
    .populate({
      path: "content",
      populate: { path: "mentions", select: "username", model: "User" },
    })

    .limit(NUM_TO_LOAD + 1);

  if (clusters.length < NUM_TO_LOAD + 1) {
    depleted = true;
  } else if (clusters.length === NUM_TO_LOAD + 1) {
    clusters.splice(clusters.length - 1, 1);
  }

  for (const cluster of await clusters) {
    partialChat.unshift(cluster);
  }

  callback({
    target: fetchParams.target,
    data: partialChat,
    depleted,
  });
}

export function broadcastStatusChange(params) {
  const { target, statusData } = params;

  socketUsers.setStatus({
    target,
    status: statusData.status,
    forced: statusData.forced,
  });

  socketSync.statusEmit({
    target,
    change: statusData.status,
  });
}
