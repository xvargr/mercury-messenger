import { Server } from "socket.io";

// utils
import socketUsers from "./socketUser.js";
import ExpressError from "../utils/ExpressError.js";
import {
  sendInitData,
  newCluster,
  appendCluster,
  fetchMoreMessages,
  broadcastStatusChange,
} from "./socketEvents.js";

const DOMAIN = process.env.APP_DOMAIN;

// socket object for initializing io and handling events
const socketInstance = {
  io: null,

  connectServer(server) {
    this.io = new Server(server, {
      maxHttpBufferSize: 5e6, // 5MB
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
        const err = new ExpressError("Unauthorized", 401);
        err.data = {
          message: "UNAUTHORIZED",
          code: 401,
        };
        next(err); // refuse connection
      } else if (socketUsers.isConnected(socket)) {
        // already connected

        const prevUser = socketUsers.connectedUsers.find(
          (user) => user.userId === socket.request.user._id.toString()
        );

        const prevSocket = io.sockets.sockets.get(prevUser.socket.id);

        prevSocket?.disconnect();
        socketUsers.disconnect({ userId: socket.request.user._id });

        socketUsers.connect(socket);
        next();
      } else {
        socketUsers.connect(socket);
        next();
      }
    });

    io.on("connection", async function (socket) {
      console.log("currently connected: ", socketUsers.connectedUsers);
      console.log("users connected: ", socketUsers.connectedUsers.length);

      const sender = socket.request.user;

      // sends chat data of all groups that user is a part of
      socket.on("requestInitData", (clusterData, callback) => {
        sendInitData({ socket, sender, callback });
      });

      // new message handler
      socket.on("newCluster", (clusterData, callback) => {
        newCluster({ socket, sender, clusterData, callback });
      });

      // subsequent message handler
      socket.on("appendCluster", (clusterData, callback) =>
        appendCluster({ socket, sender, clusterData, callback })
      );

      socket.on("fetchMore", (fetchParams, callback) => {
        fetchMoreMessages({ fetchParams, callback });
      });

      socket.on("statusChange", (statusData) => {
        broadcastStatusChange({ statusData, target: sender._id });
      });

      socket.on("disconnect", function () {
        socketUsers.disconnect({ userId: socket.request.user._id });
        console.log("currently connected: ", socketUsers.connectedUsers);
        console.log("users connected: ", socketUsers.connectedUsers.length);
      });
    });
  },
};

export default socketInstance;
