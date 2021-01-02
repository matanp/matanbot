"use strict";
/* global process */
require("dotenv").config();

//twitch client
const twitch_client = require("tmi.js");

//and we need the bot
const bot = require("./bot_brain.js");

const connectOBSWebsocket = require("./obs_helper").connect;

// Define configuration options from env file
const client_config = {
  identity: {
    username: process.env.USER,
    password: process.env.OATH,
  },
  channels: [process.env.CHANNEL],
};

// Create a Twitch client with options
const client = new twitch_client.client(client_config);

// Register event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

connectOBSWebsocket(); //connect to obs

/*
// Called every time a message comes in
 target_channel is the twitch channel the message is coming from
 user_info is information about the user -- see example_context
 user_msg is the actual message
 from_self is a boolean of if the message is coming from this client
*/
function onMessageHandler(target_channel, user_info, user_msg, from_self) {
  if (from_self) {
    return;
  }
  //console.log(target);
  //console.log(context);
  console.log(user_msg);

  let response_promise = bot.message_main(user_info, user_msg);
  response_promise.then(
    (result) => {
      if (result) client.say(target_channel, result);
    },
    (error) => console.log(error)
  );
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
