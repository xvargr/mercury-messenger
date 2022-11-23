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
        // address: socket.request.connection.remoteAddress // request.connection.remotePort // request.connection._peername // handshake.address are alternatives
        userId: socket.request.user.id,
        instances: [
          { id: socket.id, address: socket.request.connection.remoteAddress },
        ],
      });
    } else {
      this.connectedUsers[userIndex].instances.push({
        id: socket.id,
        address: socket.request.connection.remoteAddress,
      });
    }
  },
  disconnect(socket) {
    const index = this.connectedUsers.findIndex((user) =>
      user.instances.some((instance) => instance.id === socket.id)
    );

    if (this.connectedUsers[index].instances.length === 1) {
      this.connectedUsers.splice(index, 1);
    } else {
      const instanceIndex = this.connectedUsers[index].instances.findIndex(
        (instance) => instance.id === socket.id
      );

      this.connectedUsers[index].instances.splice(instanceIndex, 1);
    }
  },
  isConnected(socket) {
    return this.connectedUsers.some(
      (user) =>
        user.userId === socket.request.user.id &&
        user.instances.some(
          (instance) =>
            instance.address === socket.request.connection.remoteAddress
        )
    );
  },
  getInstances(idArray) {
    const result = [];

    idArray.forEach((id) => {
      const index = this.connectedUsers.findIndex((user) => user.userId === id);
      if (index !== -1) {
        this.connectedUsers[index].instances.forEach((instance) =>
          result.push(instance)
        );
      } else return null;
    });

    return result;
  },
};

async function constructChatData(args) {
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

  const chatData = {};

  // forEach is not async friendly, use for of
  for (const group of userGroups) {
    if (!single) socket.join(`g:${group.id}`);
    chatData[group.id] = {};
    for (const channel of group.channels.text) {
      if (!single) socket.join(`c:${channel.id}`);
      chatData[group.id][channel.id] = [];

      const clusters = await Message.find({ channel })
        .sort({
          clusterTimestamp: "desc",
        })
        .populate({
          path: "sender",
          select: ["userImage", "username", "userColor"],
        })
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
      select: ["username", "userColor"],
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
        origin: [DOMAIN, "http://192.168.0.137:3000"],
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
        !socketUsers.isConnected(socket)
      ) {
        socketUsers.connect(socket);
        next();
      } else {
        const err = new ExpressError("Unauthorized", 401);
        err.data = {
          message: "App already open on this device, click to use here instead",
        }; // feature not necessary, api and app can handle multiple instances
        next(err); // refuse connection
      }
    });

    this.io.on("connection", async function (socket) {
      console.log("currently connected: ", socketUsers.connectedUsers);

      // todo use connectedUsers array to show if user is online
      // todo private messages and friends

      // todo on reconnect reload data

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

// todo join group emit ChatData
const socketSync = {
  async channelEmit(args) {
    const io = socketInstance.io;
    const { target, change, initiator, origin } = args;

    // get initiator socket, used for ignoring sender
    const userInstances = socketUsers.getInstances([initiator.id]);
    const senderSocket = userInstances.find(
      (instance) => instance.address === origin
    );

    // pre
    if (change.type === "create") {
      // get relevant sockets to join new room
      io.in(`g:${target.parent}`).socketsJoin(`c:${target.id}`);
    }

    io.in(`c:${target.id}`)
      .except(senderSocket.id)
      .emit("structureChange", {
        target: { ...target },
        change: { ...change },
      });

    if (change.type === "delete") {
      // leave all socket from room, thus deleting it
      io.in(`c:${target.id}`).socketsLeave(`c:${target.id}`);
    }
  },

  groupEmit(args) {
    const io = socketInstance.io;
    const { target, change, initiator, origin } = args;

    const userInstances = socketUsers.getInstances([initiator.id]);
    const senderSocket = userInstances.find(
      (instance) => instance.address === origin
    );

    const userSockets = userInstances.map((instance) =>
      io.sockets.sockets.get(instance.id)
    );

    // console.log("userInstances", userInstances);
    // console.log("senderSocket", senderSocket);
    // console.log(userSockets);

    if (change.type === "create" || change.type === "join") {
      // join the group's room
      userSockets.forEach((socket) => socket.join(`g:${target.id}`));

      // join the rooms of each channel
      change.data.channels.text.forEach((channel) => {
        userSockets.forEach((socket) => socket.join(`c:${channel.id}`));
      });
    }

    // pre emit

    io.in(`g:${target.id}`)
      .except(senderSocket.id)
      .emit("structureChange", {
        target: { ...target },
        change: { ...change },
      });

    // Post emit

    // ! todo join sync - client
    // ! todo leave sync - controller, client
    // ! todo edit sync - here

    if (change.type === "delete" || change.type === "leave") {
      console.log("leaving rooms...");
      // leave the group's room
      io.in(`g:${target.id}`).socketsLeave(`g:${target.id}`);

      // leave the rooms of each channel
      change.data.channels.text.forEach((channel) => {
        userSockets.forEach((socket) => socket.leave(`c:${channel.id}`));
      }); // ! untested

      console.log(userSockets);
    }

    if (change.type === "join") {
      return constructChatData({
        socket: senderSocket,
        sender: initiator,
        single: target.id,
      });
    }

    // if (change.type === "leave") {
    //   // todo for each socket of userInstances, leave room
    // }
  },
};

export { socketInstance, socketSync };
