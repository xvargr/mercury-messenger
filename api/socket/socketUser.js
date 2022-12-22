// this is a helper object that provide methods to help with managing user connections
import { broadcastStatusChange } from "./socketEvents.js";

import User from "../models/User.js";

const socketUsers = {
  connectedUsers: [],

  connect(socket) {
    const user = socket.request.user;

    console.log("LOGINUSR");
    console.log(user);

    this.connectedUsers.push({
      userId: socket.request.user.id,
      status: "online", // !
      statusForced: false,
      socket: {
        id: socket.id,
        address: socket.request.connection.remoteAddress,
      },
    });

    // console.log(user);

    broadcastStatusChange({
      statusData: { status: user.forcedStatus ?? "online" },
      target: user._id,
    }); // ! untested
  },

  async disconnect(params) {
    const { userId } = params; // can disconnect by id, or by socket
    // const userId = params.userId.toString();

    // if (!socket && !userId) {
    //   throw new Error("either and id or socket is needed");
    // }

    // console.log("params", params);
    // console.log("socket", socket);
    // console.log("request", socket.request);
    // const user = socket.request.user;

    // console.log(user);

    // let index;
    // if (socket) {
    //   index = this.connectedUsers.findIndex(
    //     (user) => user.socket.id === socket.id
    //   );
    // } else if (userId) {
    const index = this.connectedUsers.findIndex(
      (user) => user.userId === userId.toString()
    );
    // index = this.connectedUsers.findIndex(
    //   (user) => user.socket.id === userId.toString()
    // );
    // }

    // console.log(userId);
    // console.log(this.connectedUsers);
    // console.log(index); // ! -1

    // console.log(this.connectedUsers[index].status);
    if (this.connectedUsers[index].status !== "offline") {
      broadcastStatusChange({
        target: userId, // undefined
        statusData: { status: "offline" },
      });
    } // ! untested

    const statusIsForced = this.connectedUsers[index].statusForced; // ! can be undefined

    // ! untested
    console.log(this.connectedUsers[index]);
    if (statusIsForced) {
      const user = await User.findById(userId);
      console.log("SAVE");
      console.log(user);

      user.forcedStatus = this.connectedUsers[index]; // ! crash here
      await user.save(); // !
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

    // console.log(params);

    // if (typeof target !== "string") target = target.toString();

    // console.log("forced", forced);

    if (!validStatuses.includes(status)) {
      throw new Error("invalid status parameter");
    }

    const index = this.connectedUsers.findIndex(
      (user) => user.userId === target
    );

    if (index !== -1) {
      this.connectedUsers[index].status = status;
      if (forced) this.connectedUsers[index].statusForced = true; // ! not boolean, instead status type
    } else return null;
  },
};

export default socketUsers;
