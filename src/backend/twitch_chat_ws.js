require("dotenv").config();
const WebSocket = require("ws");

const port = process.env.WS_PORT || 8080;
const server = new WebSocket.Server({
  port: port,
});

let sockets = [];
server.on("connection", function (socket) {
  console.log("server connected");
  sockets.push(socket);

  // When you receive a message, send that message to every socket.
  socket.on("message", function (msg) {
    console.log(`server recevied: ${msg}`)
    sockets.forEach((s) => s.send(msg));
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on("close", function () {
    sockets = sockets.filter((s) => s !== socket);
  });
});

let chat_client = new WebSocket(`ws://localhost:${port}`);
chat_client.on('message', msg => console.log(msg));

module.exports = { chat_client: chat_client }
