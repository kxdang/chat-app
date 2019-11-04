const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server); //call this function to configure socket io to work with a given server

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on("connection", socket => {
  console.log("New WebSocket connection");
  socket.emit("countUpdated", count);

  socket.on("increment", () => {
    count++;
    // socket.emit("countUpdated", count); //emits to single connection
    io.emit("countUpdated", count); //emits to every single connection
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
