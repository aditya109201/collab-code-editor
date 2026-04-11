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

// In-memory room storage
const roomState = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    if (!roomState[roomId]) {
      roomState[roomId] = {
        code: "// Start coding here",
        language: "javascript"
      };
    }

    socket.emit("load_state", roomState[roomId]);
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
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send("Collaborative Code Editor backend is running.");
});

server.listen(5001, () => {
  console.log("Server listening on http://localhost:5001");
});
