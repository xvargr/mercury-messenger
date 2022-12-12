import { Server } from "socket.io";

import Group from "../models/Group.js";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

import ExpressError from "./ExpressError.js";

const DOMAIN = process.env.APP_DOMAIN;
const NUM_TO_LOAD = 20;

// this is a helper object that provide methods to help with ensuring a single connection per user
const socketUsers = {
  connectedUsers: [],

  connect(socket) {
    const userIndex = this.connectedUsers.findIndex(
      (user) => user.userId === socket.request.user.id
    );
    if (userIndex === -1) {
      this.connectedUsers.push({
        userId: socket.request.user.id,
        status: "online",
        instances: [
          {
            id: socket.id,
            address: socket.request.connection.remoteAddress,
          },
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
    // const userInstance = this.connectedUsers.find(
    //   (user) =>
    //     user.userId === socket.request.user.id &&
    //     user.instances.some(
    //       (instance) =>
    //         instance.address === socket.request.connection.remoteAddress
    //     )
    // );

    // console.log("userInstance", userInstance);

    // if (!userInstance) return false;

    // userInstance.instances.forEach((instance) => {
    //   // console.log("instances", instance); // ! check each socket to make sure it is still actually connected

    //   // console.log(io);
    //   console.log("instance.socket.id", instance.socket.id);
    //   console.log("instance.socket.connected", instance.socket.connected);
    //   console.log("instance.socket.connected", instance.socket.connected);

    //   // const instances = socketUsers.getInstances([socket.request.user.id]);

    //   //  const connected =   io.sockets.sockets.get(instances.id); //foreach
    // });
    // !

    // const result = this.connectedUsers.reduce((accumulator, currentUser) => {
    //   if (
    //     currentUser.userId === socket.request.user.id &&
    //     currentUser.instances.some(
    //       (instance) =>
    //         instance.address === socket.request.connection.remoteAddress
    //     )
    //   ) {
    //     accumulator.push(currentUser);
    //   }
    //   return accumulator;
    // }, []);

    // console.log("socket.request", socket.request.user);

    return this.connectedUsers.some(
      (user) =>
        user.userId === socket.request.user.id &&
        user.instances.some(
          (instance) =>
            instance.address === socket.request.connection.remoteAddress
        )
    );
    // console.log("result:", userInstance);
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

  // getSockets(idArray) {
  //   const result = [];

  //   idArray.forEach((id) => {
  //     const index = this.connectedUsers.findIndex((user) => user.userId === id);
  //     if (index !== -1) {
  //       this.connectedUsers[index].instances.forEach((instance) =>
  //         result.push(instance.socket)
  //       );
  //     } else return null;
  //   });

  //   return result;
  // },

  getStatus(idString) {
    const user = this.connectedUsers.find((user) => {
      return user.userId === idString.toString();
    });
    if (user) return user.status;
    else return "offline";
  },

  // ! here, emit on change?
  changeStatus(idString, status) {
    if (typeof idString !== "string") idString = idString.toString();
    const index = this.connectedUsers.findIndex(
      (user) => user.userId === idString
    );

    if (index !== -1) {
      this.connectedUsers[index].status = status;
    } else return null;
  },
};

// socket event functions
async function constructInitData(args) {
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
  const peerData = {};
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
        .select(["content", "dateString", "timestamp", "clusterTimestamp"])
        .populate({
          path: "sender",
          select: ["userImage", "username", "userColor"],
        })
        .limit(NUM_TO_LOAD);

      for (const cluster of await clusters) {
        chatData[group.id][channel.id].unshift(cluster);
      }
    }
    for (const member of group.members) {
      peerData[member._id] = { status: socketUsers.getStatus(member._id) };
    }
  }

  return { chatData, peerData };
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

async function fetchMoreMessages(args) {
  const { socket, sender, fetchParams, callback } = args;

  const partialChat = [];

  const clusters = await Message.find({
    channel: fetchParams.target.channel,
    clusterTimestamp: { $lt: fetchParams.last },
  })
    .sort({
      clusterTimestamp: "desc",
    })
    .select(["content", "dateString", "timestamp", "clusterTimestamp"])
    .populate({
      path: "sender",
      select: ["userImage", "username", "userColor"],
    })
    .limit(NUM_TO_LOAD);
  // .lean();

  for (const cluster of await clusters) {
    partialChat.unshift(cluster);
  }

  // console.log(partialChat);
  console.log(partialChat.length);
  //
  callback({
    target: fetchParams.target,
    data: partialChat,
    clustersDepleted: partialChat.length < NUM_TO_LOAD,
  });
}

// socket object for initializing io and handling events
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
    const io = this.io;
    // middleware - refuse connection if not authenticated or user already has connection with connecting ip
    io.use(async function (socket, next) {
      if (!socket.request.isAuthenticated()) {
        // not authenticated
        console.log("NOT AUTH");
        const err = new ExpressError("Unauthorized", 401);
        err.data = {
          message: "UNAUTHORIZED",
          code: 401,
        }; // feature not necessary, api and app can handle multiple instances
        next(err); // refuse connection
      } else if (socketUsers.isConnected(socket)) {
        // already connected
        console.log("CON DUPE");
        const err = new ExpressError("Unauthorized", 401);
        err.data = {
          message: "App already open on this device, click to use here instead",
        }; // feature not necessary, api and app can handle multiple instances

        // ! checking against io if duplicate socket connections are still open
        if (socketUsers.isConnected(socket)) {
          const instances = socketUsers.getInstances([socket.request.user.id]);

          // const sockets = [];
          instances.forEach(
            (instance) => {
              // console.log(instance);
              console.log(
                `${instance.socket.id} is connected => ${instance.socket.connected}`
              );

              // console.log(io.sockets.sockets.get(instance.socket.id));

              console.log(
                `${instance.socket.id} is TRULY connected => ${
                  io.sockets.sockets.get(instance.socket.id)?.connected
                }`
              );

              // edge case where socket is not terminated but disconnect event does not fire, still considered connected in usrcon object
              if (!io.sockets.sockets.get(instance.socket.id)?.connected) {
                console.log("DC this SOCKET");
                console.log(socket);
                // socketUsers.disconnect(socket);
              }
            }
            // sockets.push(io.sockets.sockets.get(instance.id))
          );
        }
        // BS

        next(err); // refuse connection
      } else {
        socketUsers.connect(socket);
        next();
      }
    });

    io.on("connection", async function (socket) {
      console.log("currently connected: ", socketUsers.connectedUsers);

      // todo use connectedUsers array to show if user is online
      // todo private messages and friends

      const sender = await User.findById(socket.request.user.id)
        .select("username")
        .lean();

      const initData = await constructInitData({ socket, sender });

      // sends chat data of all groups that user is a part of
      socket.emit("initialize", initData);

      // new message handler
      socket.on("newCluster", (clusterData, callback) => {
        newCluster({ socket, sender, clusterData, callback });
      });

      // subsequent message handler
      socket.on("appendCluster", (clusterData, callback) =>
        appendCluster({ socket, sender, clusterData, callback })
      );

      socket.on("fetchMore", (fetchParams, callback) => {
        console.log("fetch signal received");
        fetchMoreMessages({ socket, sender, fetchParams, callback });
      });

      // user online status change
      socket.on("statusChange", (statusData) => {
        const { change } = statusData;
      });

      // todo connection status
      socket.on("disconnect", function () {
        // console.log(socket.rooms); // * already empty by this point
        // ? use room events? socket on join-room leave-room

        socketUsers.disconnect(socket);
        console.log("currently connected: ", socketUsers.connectedUsers);
      });
    });
    // console.log(this.io.engine);
    // this.io.engine.on("close", (reason) => console.log(reason));

    // room events below are used to sync up member's status with clients on front end
    // ? by joins and leave rooms or on connect and dc
    // this.io.of("/").adapter.on("join-room", (room, id) => {
    //   if (room.includes("g:"))
    //     console.log(`socket ${id} has joined room ${room}`);
    // });

    // this.io.of("/").adapter.on("leave-room", (room, id) => {
    //   console.log(`socket ${id} has left room ${room}`);
    // });
  },
};

// this object sends events that syncs up the client's chat and group data whenever changes are made to -
// any group or channel the user is a part of
const socketSync = {
  async channelEmit(args) {
    const io = socketInstance.io;
    const { target, change, initiator, origin, messages = [] } = args;

    // get initiator socket, used for ignoring sender
    const userInstances = socketUsers.getInstances([initiator.id]);
    const senderSocket = userInstances.find(
      (instance) => instance.address === origin
    );

    if (change.type === "create") {
      // get relevant sockets to join new room
      io.in(`g:${target.parent}`).socketsJoin(`c:${target.id}`);
    }

    // pre emit ↑↑↑

    io.in(`c:${target.id}`)
      .except(senderSocket.id)
      .emit("structureChange", {
        target: { ...target },
        change: { ...change },
        messages: [...messages],
      });

    // Post emit ↓↓↓

    if (change.type === "delete") {
      // leave all socket from room, thus deleting it
      io.in(`c:${target.id}`).socketsLeave(`c:${target.id}`);
    }
  },

  groupEmit(args) {
    const io = socketInstance.io;
    const { target, change, initiator, origin, messages = [] } = args;

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

    // pre emit ↑↑↑

    console.log("WFY DO YTOYU MENAB UNDEFUINED????", senderSocket);

    io.in(`g:${target.id}`)
      .except(senderSocket.id) // !!!!!!!!!!! sometimes undefined???
      .emit("structureChange", {
        target: { ...target },
        change: { ...change },
        messages: [...messages],
      });

    // Post emit ↓↓↓

    if (change.type === "delete") {
      // leave the group's room
      io.in(`g:${target.id}`).socketsLeave(`g:${target.id}`);

      // leave the rooms of each channel
      change.data.channels.text.forEach((channel) => {
        io.in(`c:${channel._id}`).socketsLeave(`c:${channel._id}`);
      });
    }

    if (change.type === "leave" || change.extra?.toKick) {
      let leavingInstances;
      if (change.type === "leave") {
        leavingInstances = socketUsers.getInstances([change.extra.userId]);
      } else if (change.extra?.toKick) {
        leavingInstances = socketUsers.getInstances(change.extra.toKick);
      }
      // console.log("instances", leavingInstances);

      leavingInstances.forEach((instance) => {
        const socket = io.sockets.sockets.get(instance.id);

        socket.leave(`g:${target.id}`);

        change.data.channels.text.forEach((channel) => {
          socket.leave(`c:${channel._id}`);
        });
      });
    }

    if (change.type === "join") {
      // return chatData of the joined group to new member for axios response
      return constructInitData({
        socket: senderSocket,
        sender: initiator,
        single: target.id,
      });
    }
  },
};

export { socketInstance, socketSync };
