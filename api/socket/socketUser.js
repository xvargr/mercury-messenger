// this is a helper object that provide methods to help with managing user connections
import { broadcastStatusChange } from "./socketEvents.js";

import User from "../models/User.js";

const socketUsers = {
  connectedUsers: [],

  connect(socket) {
    const user = socket.request.user;

    this.connectedUsers.push({
      userId: socket.request.user.id,
      status: user.forcedStatus ?? "online",
      statusForced: false,
      socket: {
        id: socket.id,
        address: socket.request.connection.remoteAddress,
      },
    });

    broadcastStatusChange({
      statusData: { status: user.forcedStatus ?? "online" },
      target: user._id,
    });
  },

  async disconnect(params) {
    const { userId } = params;

    const index = this.connectedUsers.findIndex(
      (user) => user.userId === userId.toString()
    );

    // user already disconnected before proper dismount
    if (index < 0) {
      // console.log("user disconnected unexpectedly");
      broadcastStatusChange({
        target: userId,
        statusData: { status: "offline" },
      });

      return null;
    }

    const statusIsForced = this.connectedUsers[index].statusForced;

    const user = await User.findById(userId);

    if (statusIsForced) {
      user.forcedStatus = this.connectedUsers[index].status;
    } else {
      user.forcedStatus = undefined;
    }

    await user.save();

    if (this.connectedUsers[index]?.status !== "offline") {
      broadcastStatusChange({
        target: userId,
        statusData: { status: "offline" },
      });
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
    const { status, forced = false } = params;
    const target = params.target.toString();

    const validStatuses = ["online", "away", "busy", "offline"];
    if (!validStatuses.includes(status)) {
      throw new Error("invalid status parameter");
    }

    const index = this.connectedUsers.findIndex(
      (user) => user.userId === target
    );

    if (index !== -1) {
      this.connectedUsers[index].status = status;
      if (forced) this.connectedUsers[index].statusForced = true;
    } else {
      console.warn("!-> user not found");
      // throw new Error("user not found");
    }
  },
};

export default socketUsers;
