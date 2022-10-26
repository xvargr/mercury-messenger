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
  connect(socket) {
    const userIndex = this.connectedUsers.findIndex(
      (user) => user.userId === socket.request.user.id
    );
    if (userIndex === -1) {
      this.connectedUsers.push({
        name: socket.request.user.username,
        userId: socket.request.user.id,
        socketId: [socket.id],
      });
    } else {
      this.connectedUsers[userIndex].socketId.push(socket.id);
    }
  },
  disconnect(socket) {
    const index = this.connectedUsers.findIndex((user) =>
      user.socketId.some((id) => id === socket.id)
    );

    if (this.connectedUsers[index].socketId.length === 1) {
      this.connectedUsers.splice(index, 1);
    } else {
      const newSocketIds = this.connectedUsers[index].socketId.filter(
        (id) => id !== socket.id
      );
      this.connectedUsers[index].socketId = [...newSocketIds];
    }
  },
  isConnected(socket) {
    return this.connectedUsers.some(
      (user) => user.userId === socket.request.user.id
    );
  },
  getSocketIds(idArray) {
    const result = [];

    idArray.forEach((id) => {
      const index = this.connectedUsers.findIndex((user) => user.userId === id);
      if (index !== -1) {
        this.connectedUsers[index].socketId.forEach((socket) =>
          result.push(socket)
        );
      }
    });

    return result;
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
      if (socket.request.isAuthenticated()) {
        socketUsers.connect(socket);
        next();
      } else {
        const err = new ExpressError("Unauthorized", 401);
        // err.data = {
        //   message: "Another device, click to use here instead",
        // }; // feature not necessary, api and app can handle multiple instances
        next(err); // refuse connection
      }
    });

    this.io.on("connection", async function (socket) {
      console.log("currently connected: ", socketUsers.connectedUsers);

      // todo add socket to room on new create
      // * can use connectedUsers array to show if user is online
      // ! todo broadcast changes to group and channels
      // ! todo on new channel update chatData

      const sender = await User.findById(socket.request.user.id).lean();

      const initData = await constructChatData({ socket, sender });

      // sends chat data of all groups that user is a part of
      socket.emit("initialize", initData);

      // new message handler
      socket.on("newCluster", (clusterData, callback) =>
        newCluster({ socket, sender, clusterData, callback })
      );

      // subsequent message handler
      socket.on("appendCluster", (clusterData, callback) =>
        appendCluster({ socket, clusterData, callback })
      );

      socket.on("disconnect", function () {
        socketUsers.disconnect(socket);
        console.log("currently connected: ", socketUsers.connectedUsers);
      });
    });
  },
};

const socketSync = {
  async emitChanges(args) {
    const io = socketInstance.io;
    const { target, change } = args;
    const roomType = target.type === "channel" ? "c:" : "g:";

    // console.log(currChannel);
    // console.log(parentGroup); // ! parent can no longer be found if on delete

    // ? need parent to get sockets to update

    // ? sockets are unknown, but we can close the room without knowing the socketIds

    if (change.type === "create") {
      const currChannel = await Channel.findById(target.id).lean();
      const parentGroup = await Group.findOne({
        "channels.text": currChannel,
      })
        .populate({
          path: "members",
          select: ["_id", "username"],
        })
        .lean();

      const idsAffected = parentGroup.members.map((member) =>
        member._id.toString()
      );
      const socketsAffected = socketUsers.getSocketIds(idsAffected);

      socketsAffected.forEach((socketId) => {
        const userSocket = io.sockets.sockets.get(socketId);
        userSocket.join(`${roomType}${target.id}`);
      });

      io.in(`${roomType}${target.id}`).emit("structureChange", {
        target: { ...target, parent: parentGroup._id },
        change: { ...change },
      });
    } else if (change.type === "delete") {
      io.in(`${roomType}${target.id}`).emit("structureChange", {
        target: { ...target },
        change: { ...change },
      });

      // io.sockets
      //   .clients(`${roomType}${target.id}`) // ! clients is not a a function
      //   .forEach((client) => client.leave(`${roomType}${target.id}`));

      io.in(`${roomType}${target.id}`).socketsLeave(`${roomType}${target.id}`);
    }
  },
};

export { socketInstance, socketSync };
