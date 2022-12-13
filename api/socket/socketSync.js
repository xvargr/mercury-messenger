// utils
import socketInstance from "./socket";
import socketUsers from "./socketUser";
import { constructInitData } from "./socketEvents";

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

export default socketSync;
