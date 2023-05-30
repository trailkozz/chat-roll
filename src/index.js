const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { generatemsg, generateLocation } = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

const publicdir = path.join(__dirname, "../public");

app.use(express.static(publicdir));

io.on("connection", (socket) => {
  console.log("new connection");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return cb(error);
    }
    socket.join(user.room);
    socket.emit(
      "message",
      generatemsg(`Welcome, ${user.username}, to room ${user.room}!`)
    );
    socket.broadcast
      .to(user.room)
      .emit("message", generatemsg(`Player ${user.username} has joined!`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });
    cb();
  });

  socket.on("sendMessage", (msg, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generatemsg(user.username, msg));
    cb();
  });

  socket.on("roll3d6", (msg, cb) => {
    const user = getUser(socket.id);
    var dieRolls = [];
    for (var i = 0; i < 3; i++) {
      dieRolls.push(Math.round(Math.random() * 5 + 1));
    }
    io.to(user.room).emit(
      "message",
      generatemsg(
        "Rollbot",
        `${user.username} rolled a total of ${dieRolls.reduce(
          (a, b) => a + b
        )}.  Details: [${dieRolls}]`
      )
    );
  });

  socket.on("roll1d6", (msg, cb) => {
    const user = getUser(socket.id);
    var dieRolls = [];
    for (var i = 0; i < 3; i++) {
      dieRolls.push(Math.round(Math.random() * 5 + 1));
    }
    io.to(user.room).emit(
      "message",
      generatemsg(
        "Rollbot",
        `${user.username} rolled a ${Math.round(Math.random() * 5) + 1}`
      )
    );
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);
    if (user) {
      io.to(user.room).emit(
        "message",
        generatemsg(`Player ${user.username} has left`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});
server.listen(PORT, () => {
  console.log("server s up" + PORT);
});
