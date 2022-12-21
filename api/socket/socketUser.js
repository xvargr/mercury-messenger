// this is a helper object that provide methods to help with managing user connections
import { broadcastStatusChange } from "./socketEvents.js";

import User from "../models/User.js";

const socketUsers = {
  connectedUsers: [],

  connect(socket) {
    const user = socket.request.user;
    this.connectedUsers.push({
      userId: socket.request.user.id,
      status: "online",
      statusForced: false,
      socket: {
        id: socket.id,
        address: socket.request.connection.remoteAddress,
      },
    });

    broadcastStatusChange({
      statusData: { status: user.forcedStatus ?? "online" },
      sender: user,
    }); // ! untested
  },

  async disconnect(params) {
    const { userId, socket } = params;
    const user = socket.request.user;

    console.log(user);

    let index;
    if (socket) {
      index = this.connectedUsers.findIndex(
        (user) => user.socket.id === socket.id
      );
    } else if (userId) {
      index = this.connectedUsers.findIndex(
        (user) => user.socket.id === userId.toString()
      );
    }

    broadcastStatusChange({
      statusData: { status: "offline" },
      sender: user,
    }); // ! untested

    const statusIsForced = this.connectedUsers[index].statusForced;

    // ! untested
    console.log(this.connectedUsers[index]);
    if (statusIsForced) {
      // user.forcedStatus = true;
      // await user.save(); // !
    }

    this.connectedUsers.splice(index, 1);
  },

  isConnected(socket) {
    return this.connectedUsers.some(
      (user) => user.userId === socket.request.user.id
    );
  },

  getSocketId(idString) {
    const result = this.connectedUsers.find((user) => user.userId === idString);
    return result.socket.id;
  },

  getStatus(idString) {
    const user = this.connectedUsers.find((user) => {
      return user.userId === idString.toString();
    });
    if (user) return user.status;
    else return "offline";
  },

  setStatus(params) {
    const { target, status, forced = false } = params;
    const validStatuses = ["online", "away", "busy", "offline"];

    // if (typeof target !== "string") target = target.toString();

    console.log("forced", forced);

    if (!validStatuses.includes(status)) {
      throw new Error("invalid status parameter");
    }

    const index = this.connectedUsers.findIndex(
      (user) => user.userId === target
    );

    if (index !== -1) {
      this.connectedUsers[index].status = status;
      if (forced) this.connectedUsers[index].statusForced = true;
    } else return null;
  },
};

export default socketUsers;
