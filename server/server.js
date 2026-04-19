const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const roomState = {};
const socketToUser = {};

function getRoomUsers(roomId) {
  if (!roomState[roomId]) return [];
  return roomState[roomId].users.map((user) => user.username);
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!roomState[roomId]) {
      roomState[roomId] = {
        code: "// Start coding here",
        language: "javascript",
        users: []
      };
    }

    const user = { socketId: socket.id, username };
    roomState[roomId].users.push(user);
    socketToUser[socket.id] = { roomId, username };

    socket.emit("load_state", {
      code: roomState[roomId].code,
      language: roomState[roomId].language
    });

    io.to(roomId).emit("user_list", getRoomUsers(roomId));
    io.to(roomId).emit("system_message", `${username} joined the room`);
  });

  socket.on("code_change", ({ roomId, code }) => {
    if (!roomState[roomId]) return;

    roomState[roomId].code = code;
    socket.to(roomId).emit("receive_code", code);
  });

  socket.on("language_change", ({ roomId, language }) => {
    if (!roomState[roomId]) return;

    roomState[roomId].language = language;
    socket.to(roomId).emit("receive_language", language);
  });

  socket.on("disconnect", () => {
    const userInfo = socketToUser[socket.id];
    if (!userInfo) {
      console.log(`User disconnected: ${socket.id}`);
      return;
    }

    const { roomId, username } = userInfo;

    if (roomState[roomId]) {
      roomState[roomId].users = roomState[roomId].users.filter(
        (user) => user.socketId !== socket.id
      );

      io.to(roomId).emit("user_list", getRoomUsers(roomId));
      io.to(roomId).emit("system_message", `${username} left the room`);

      if (roomState[roomId].users.length === 0) {
        delete roomState[roomId];
      }
    }

    delete socketToUser[socket.id];
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send("Collaborative Code Editor backend is running.");
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});