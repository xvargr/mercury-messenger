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

    if (change.type === "delete") {
      // leave all socket from room, thus deleting it
      io.in(`c:${target.id}`).socketsLeave(`c:${target.id}`);
    }
  },

  groupEmit(args) {
    const io = socketInstance.io;
    const { target, change, initiator, messages = [] } = args;

    const senderSocketId = socketUsers.getSocketId(initiator.id);
    const senderSocket = io.sockets.sockets.get(senderSocketId);

    if (change.type === "create" || change.type === "join") {
      // join the group's room
      senderSocket.join(`g:${target.id}`);

      // join channel rooms
      change.data.channels.text.forEach((channel) => {
        senderSocket.join(`c:${channel.id}`);
      });

      // join user status rooms
      change.data.members.forEach((member) => {
        senderSocket.join(`s:${member.id}`);
      });
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
        io.in(`c:${channel.id}`).socketsLeave(`c:${channel.id}`);
      });

      // leave user status rooms, but what if user is in other group rooms too?
      // change.data.members.forEach(member => {
      // io.in(`s:${member.id}`).socketsLeave(`s:${member.id}`);
      // })
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
          leavingSocket.leave(`c:${channel.id}`);
        });

        // dupe users? handle
        // change.data.members.forEach((member) => {
        //   leavingSocket.leave(`s:${member.id}`);
        // });
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

  statusEmit(args) {
    const io = socketInstance.io;
    const { target, change } = args;

    io.in(`s:${target}`)
      // .except(senderSocketId)
      .emit("statusChange", {
        target,
        change,
        // messages: [...messages],
      });
  },
};

export default socketSync;
