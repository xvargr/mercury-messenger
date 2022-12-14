// utils
import socketInstance from "./socket.js";
import socketUsers from "./socketUser.js";
import { constructInitData } from "./socketEvents.js";

// this object sends events that syncs up the client's chat and group data whenever changes are made to -
// any group or channel the user is a part of

const socketSync = {
  async channelEmit(args) {
    const io = socketInstance.io;
    const { target, change, initiator, messages = [] } = args;

    // get initiator socket, used for ignoring sender
    const senderSocketId = socketUsers.getSocketId(initiator.id);
    // const senderSocket = userInstance.find(
    //   (instance) => instance.address === origin
    // );

    if (change.type === "create") {
      // get relevant sockets to join new room
      io.in(`g:${target.parent}`).socketsJoin(`c:${target.id}`);
    }

    // pre emit ↑↑↑

    io.in(`c:${target.id}`)
      .except(senderSocketId)
      .emit("structureChange", {
        target: { ...target },
        change: { ...change },
        messages: [...messages],
      });

    // Post emit ↓↓↓

    // ! admin that kicks user is not in room anymore??
    // no socketsync signals and no long er gets emits to room

    if (change.type === "delete") {
      // leave all socket from room, thus deleting it
      io.in(`c:${target.id}`).socketsLeave(`c:${target.id}`);
    }
  },

  groupEmit(args) {
    const io = socketInstance.io;
    const { target, change, initiator, messages = [] } = args;

    const senderSocketId = socketUsers.getSocketId(initiator.id);
    // const senderSocket = userInstances.find(
    //   (instance) => instance.address === origin
    // );
    // const userSockets = userInstances.map((instance) =>
    //   io.sockets.sockets.get(instance.id)
    // );
    const senderSocket = io.sockets.sockets.get(senderSocketId);

    // console.log("userInstances", userInstances);
    // console.log("senderSocket", senderSocket);
    // console.log(userSockets);

    if (change.type === "create" || change.type === "join") {
      // join the group's room
      // userSockets.forEach((socket) => socket.join(`g:${target.id}`));
      senderSocket.join(`g:${target.id}`);

      // join the rooms of each channel
      // change.data.channels.text.forEach((channel) => {
      //   userSockets.forEach((socket) => socket.join(`c:${channel.id}`));
      // });
      change.data.channels.text.forEach((channel) => {
        senderSocket.join(`c:${channel.id}`);
      });
      // senderSocket.join(`g:${target.id}`);
    }

    // pre emit ↑↑↑

    io.in(`g:${target.id}`)
      .except(senderSocketId)
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
      console.log("change.extra", change.extra);
      const leavingSocketIds = [];
      if (change.type === "leave") {
        leavingSocketIds.push(socketUsers.getSocketId(change.extra.userId));
      } else if (change.extra?.toKick) {
        change.extra.toKick.forEach((userId) => {
          leavingSocketIds.push(socketUsers.getSocketId(userId));
        });
      }

      leavingSocketIds.forEach((socketId) => {
        const leavingSocket = io.sockets.sockets.get(socketId);

        leavingSocket.leave(`g:${target.id}`);

        change.data.channels.text.forEach((channel) => {
          leavingSocket.leave(`c:${channel._id}`);
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

export default socketSync;
