const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app URL
    methods: ["GET", "POST"],
  },
});

const DOCUMENT_DATA = {};

io.on("connection", (socket) => {
  console.log("🟢 A user connected: ", socket.id);

  socket.on("get-document", (docId) => {
    if (!DOCUMENT_DATA[docId]) {
      DOCUMENT_DATA[docId] = "";
    }
    socket.join(docId);
    socket.emit("load-document", DOCUMENT_DATA[docId]);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(docId).emit("receive-changes", delta);
    });

    socket.on("save-document", (data) => {
      DOCUMENT_DATA[docId] = data;
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected: ", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
