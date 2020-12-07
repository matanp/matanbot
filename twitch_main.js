'use strict';
require('dotenv').config();

//twitch client
const tmi = require('tmi.js');

//general logger and twitch logger
//const { logger } = require('./general_logger.js');
const { twitch_log } = require('./twitch_logger.js');

//and we need the bot
const { bot } = require('./bot_brain.js');

// Define configuration options from env file
const opts = {
  identity: {
    username: process.env.USER,
    password: process.env.OATH
  },
  channels: [
    process.env.CHANNEL
  ]
};

// Create a Twitch client with options
const client = new tmi.client(opts);

// Register event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
// target is the twitch channel the message is coming from
// context is information about the user -- see example_context
// msg is the actual message
// self is a boolean of if the message is coming from this client
function onMessageHandler (target, context, msg, self) {
  twitch_log.message({username: context.username, message: msg});
  if (self) { return; }
    //console.log(target);
    //console.log(context);
    //console.log(msg);
    let response = bot(context, msg);
    if (response) {
      client.say(target, response);
    }

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}