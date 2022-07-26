// this is a helper object that provide methods to help with managing user connections

const socketUsers = {
  connectedUsers: [],

  connect(socket) {
    this.connectedUsers.push({
      userId: socket.request.user.id,
      status: "online",
      socket: {
        id: socket.id,
        address: socket.request.connection.remoteAddress,
      },
    });
  },

  disconnect(params) {
    const { userId, socket } = params;

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

  setStatus(idString, status) {
    const validStatuses = ["online", "away", "busy", "offline"];

    if (typeof idString !== "string") idString = idString.toString();

    if (!validStatuses.includes(status)) {
      throw new Error("invalid status parameter");
    }

    const index = this.connectedUsers.findIndex(
      (user) => user.userId === idString
    );

    if (index !== -1) {
      this.connectedUsers[index].status = status;
    } else return null;
  },
};

export default socketUsers;
