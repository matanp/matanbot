require("dotenv").config();
import WebSocket from 'ws';

const port : number = Number(process.env.WS_PORT) || 8080;
const server : WebSocket.Server = new WebSocket.Server({
  port: port,
});

let sockets : WebSocket[] = [];
server.on("connection", function (socket: WebSocket) {
  console.log("server connected");
  sockets.push(socket);

  // When you receive a message, send that message to every socket.
  socket.on("message", function (msg: WebSocket.Data) {
    console.log(`server recevied: ${msg}`)
    sockets.forEach((s: WebSocket) => s.send(msg));
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on("close", function () {
    sockets = sockets.filter((s: WebSocket) => s !== socket);
  });
});

export const chat_client : any = new WebSocket(`ws://localhost:${port}`);
chat_client.on('message', (msg: string) => console.log(msg));

