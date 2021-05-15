//https://dev.twitch.tv/docs/pubsub
require("dotenv").config();
import WebSocket from "ws";

let ws: WebSocket;

interface PubSubMessage {
  type: String;
  nonce: String;
  data: {
    topics: String[];
    auth_token: String;
  };
}

interface PubSubResponse {
  type: String;
  data: {
    topic: String;
    message: String;
  };
}


let connectionTries : number = 0;

//figure out next exponential backoff
//adds some random jitter, returns -1 if over 2 minutes
function exponentialBackoff(iter: number) : number {
  let backoffTime: number =  (Math.pow(2,iter) * 1000) + (Math.random() * 1000);

  if(backoffTime > 2 * 60 * 1000) {
    return -1;
  }

  return backoffTime;
}

connect();

function randomString(length: number): String {
  let text: String = "";
  let possible: String =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

//all wrapped in a function to handle reconnecting
function connect(): void {
  let needsReconnect: Boolean = false;

  ws = new WebSocket("wss://pubsub-edge.twitch.tv");

  function reconnect(): void {
    ws.close();
    connect();
  }

  ws.onopen = function (event: WebSocket.OpenEvent): void {
    console.log("opened");
    connectionTries = 0; //connnection successful, reset count
    //ping server every 4.5 - 4.55 minutes
    //randomness since Twitch asked nicely
    (function heartbeat(): void {
      let rand = 1000 * 60 * 4.5 + Math.random() * 5000;
      setTimeout(function (): void {
        ws.send(`{ "type": "PING" }`);
        needsReconnect = true; //set this to false once recieved PONG
        setTimeout(function (): void {
          if (needsReconnect) {
            reconnect();
          }
        }, 10 * 1000); //if after 10 seconds no PONG, reconnect
        heartbeat();
      }, rand);
    })();

    const listen_to_topics: PubSubMessage = {
      type: "LISTEN",
      nonce: randomString(17),
      data: {
        topics: ["channel-points-channel-v1.128811347"],
        auth_token: process.env.OATH,
      },
    };

    ws.send(JSON.stringify(listen_to_topics));
  };

  ws.onerror = function (error: WebSocket.ErrorEvent): void {
    console.log(error);
    //connection failed, try to reconnect on exponentialBackoff
    let connectionRetryTime = exponentialBackoff(connectionTries)
    if(connectionRetryTime !== -1) { setTimeout(() => connect(), connectionRetryTime); }
    connectionTries++;

  };

  ws.onmessage = function (event: WebSocket.MessageEvent): void {
    console.log(String(event.data).trim());
    const message: PubSubResponse = JSON.parse(String(event.data));

    //recieved reconnect from Twitch
    if (message.type === "RECONNECT") {
      reconnect();
    }

    if (message.type === "PONG") {
      //received PONG after PING, no need to reconnect
      needsReconnect = false;
    }
  };
}
