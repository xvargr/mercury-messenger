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

    // console.log(params);

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

  //   getInstances(idArray) {
  //     const result = [];

  //     idArray.forEach((id) => {
  //       const index = this.connectedUsers.findIndex((user) => user.userId === id);
  //       if (index !== -1) {
  //         this.connectedUsers[index].instances.forEach((instance) =>
  //           result.push(instance)
  //         );
  //       } else return null;
  //     });

  //     return result;
  //   },

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

export default socketUsers;
