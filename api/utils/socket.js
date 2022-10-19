import { Server } from "socket.io";

import Group from "../models/Group.js";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

import ExpressError from "./ExpressError.js";

const DOMAIN = process.env.APP_DOMAIN;

// this is a helper object that provide methods to help with ensuring a single connection per user
const socketUsers = {
  connectedUsers: [],
  connect(thisUser) {
    this.connectedUsers.push(thisUser);
  },
  disconnect(thisUser) {
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user !== thisUser
    );
  },
  isConnected(thisUser) {
    return this.connectedUsers.includes(thisUser);
  },
};

async function constructChatData(args) {
  // find sender and their groups in database
  const { socket, sender } = args;
  const userGroups = await Group.find({ members: sender }).populate({
    path: "channels.text",
  });

  const chatData = {};

  // forEach is not async friendly, use for of
  for (const group of userGroups) {
    socket.join(`g:${group.id}`);
    chatData[group.id] = {};
    for (const channel of group.channels.text) {
      socket.join(`c:${channel.id}`);
      chatData[group.id][channel.id] = [];

      const clusters = await Message.find({ channel })
        .sort({
          clusterTimestamp: "desc",
        })
        .populate({ path: "sender", select: ["userImage", "username"] })
        .limit(20);

      for (const cluster of await clusters) {
        chatData[group.id][channel.id].unshift(cluster);
      }
    }
  }

  return chatData;
}

async function newCluster(args) {
  const { socket, sender, clusterData, callback } = args;
  const channel = await Channel.findById(clusterData.target.channel);
  const group = await Group.findById(clusterData.target.group);

  const newMessageCluster = new Message({
    sender,
    channel,
    group,
    content: [clusterData.data],
  });

  await newMessageCluster.save();

  const populatedCluster = await newMessageCluster.populate([
    {
      path: "sender",
      select: ["username"],
      populate: { path: "userImage" },
    },
    { path: "group", select: ["name"] },
    { path: "content" },
  ]);

  socket
    .to(`c:${clusterData.target.channel}`)
    .emit("newMessage", populatedCluster); // sender still gets message // solution, use socket, not io to emit

  callback({
    target: clusterData.target,
    data: populatedCluster,
  });
}

async function appendCluster(args) {
  const { socket, clusterData, callback } = args;

  function appendAndEmit() {
    parentCluster.append(clusterData);

    socket.to(`c:${parentCluster.channel}`).emit("appendMessage", {
      target: {
        ...clusterData.target,
        cluster: {
          timestamp: clusterData.target.cluster.timestamp,
          id: parentCluster._id,
        },
      },
      data: parentCluster.content[clusterData.target.index],
    }); // sender still gets message // solution, use socket, not io to emit

    callback({
      target: {
        ...clusterData.target,
        cluster: { id: parentCluster._id },
      },
      data: parentCluster.content[clusterData.target.index],
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
  if (!parentCluster) {
    waitForParent();
  } else {
    appendAndEmit();
  }
}

function structureChange(args) {
  const { data, callback } = args;
} // ! working here, emit change

const socketInstance = {
  io: null,

  connectServer(server) {
    this.io = new Server(server, {
      cors: {
        origin: [DOMAIN, "http://192.168.0.237:3000"],
        credentials: true,
      },
      serveClient: false,
    }); // pass the created server to socket
  },

  initialize() {
    // refuse connection if not authenticated or user already has a connection
    this.io.use(async function (socket, next) {
      if (
        socket.request.isAuthenticated() &&
        !socketUsers.isConnected(socket.request.user.username)
      ) {
        socketUsers.connect(socket.request.user.username);
        next();
      } else {
        const err = new ExpressError("Unauthorized", 401);
        next(err); // refuse connection // todo unique response if already connected, offer to use current connection
      }
    });

    this.io.on("connection", async function (socket) {
      console.log(
        "user connected, ID:",
        socket.id,
        " username: ",
        socket.request.user.username
      );

      // todo add socket to room on new create
      // * can use connectedUsers array to show if user is online
      // ! todo broadcast changes to group and channels
      // ! todo on new channel update chatData

      const sender = await User.findById(socket.request.user.id).lean();

      const initData = await constructChatData({ socket, sender });

      // sends chat data of all groups that user is a part of
      socket.emit("initialize", initData);

      socket.on("structureChange", (data, callback) =>
        structureChange({ data, callback })
      ); // ! working here

      // new message handler
      socket.on("newCluster", (clusterData, callback) =>
        newCluster({ socket, sender, clusterData, callback })
      );

      // subsequent message handler
      socket.on("appendCluster", (clusterData, callback) =>
        appendCluster({ socket, clusterData, callback })
      );

      socket.on("disconnect", function () {
        socketUsers.disconnect(socket.request.user.username);
      });
    });
  },
};

export default socketInstance;
