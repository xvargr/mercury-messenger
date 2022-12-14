import { Server } from "socket.io";

// models
import User from "../models/User.js";

// utils
import socketUsers from "./socketUser.js";
import ExpressError from "../utils/ExpressError.js";
import {
  constructInitData,
  newCluster,
  appendCluster,
  fetchMoreMessages,
} from "./socketEvents.js";

const DOMAIN = process.env.APP_DOMAIN;

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
        };
        next(err); // refuse connection
      } else if (socketUsers.isConnected(socket)) {
        // already connected
        console.log("CON DUPE");

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
        // fetchMoreMessages({ socket, sender, fetchParams, callback });
      });

      // user online status change
      socket.on("statusChange", (statusData) => {
        const { change } = statusData;
      });

      // todo connection status
      socket.on("disconnect", function () {
        // console.log(socket.rooms); // * already empty by this point
        // ? use room events? socket on join-room leave-room

        socketUsers.disconnect({ socket });
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

export default socketInstance;
