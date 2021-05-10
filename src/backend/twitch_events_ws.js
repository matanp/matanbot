//https://dev.twitch.tv/docs/pubsub
require("dotenv").config();
const express = require('express');
const WebSocket = require("ws");
const fetch = require("node-fetch");

const app = express();

app.get('/auth/twitch', (req, res) => {
    console.log('expressss');
    console.log(req);
    console.log(res);

    return 'hello';
});

app.listen(8080, () => console.log('listening'));

let ws;

connect();

let clientId = process.env.CLIENT_ID;
let redirectURI = "localhost:8080/auth/twitch";
let sessionID = randomString(15);
let scope = "chat:read";

let url =
  "https://id.twitch.tv/oauth2/authorize" +
  "?response_type=token" +
  "&client_id=" +
  clientId +
  "&redirect_uri=" +
  redirectURI +
  "&state=" +
  sessionID +
  "&scope=" +
  scope;

const authorize = async () => {
  let response = await fetch(url);
  console.log(response);
//   console.log(response);
//   console.log(response.url);
//   console.log(response.headers);
};

setTimeout(() => authorize(), 1000);

function randomString(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

//all wrapped in a function to handle reconnecting
function connect() {
  ws = new WebSocket("wss://pubsub-edge.twitch.tv");

  //TODO reconnect if don't receive PONG back from PING
  ws.onopen = function (event) {
    console.log("opened");
    //ping server every 4.5 - 4.55 minutes
    //randomness since Twitch asked nicely
    (function heartbeat() {
      let rand = 1000 * 60 * 4.5 + Math.random() * 5000;
      setTimeout(function () {
        ws.send(`{ "type": "PING" }`);
        heartbeat();
      }, rand);
    })();

    //stuck on getting channel id of my channel, this one incorrect
    const listen_to_topics = {
      type: "LISTEN",
      nonce: randomString(17),
      data: {
        topics: ["channel-points-channel-v1.128811347"],
        auth_token: process.env.OATH,
      },
    };

    ws.send(JSON.stringify(listen_to_topics));
  };

  ws.onerror = function (error) {
    console.log(error);
  };

  //TODO handle RECONNECT messages from server
  ws.onmessage = function (event) {
    console.log(event.data.trim());
  };
}
