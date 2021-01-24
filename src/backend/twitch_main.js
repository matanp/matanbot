"use strict";
/* global process */
require("dotenv").config();
const fs = require("fs");

//twitch client
const twitch_client = require("tmi.js");

//and we need the bot
const bot = require("./bot_brain.js");

const twitch_chat_websocket = require('./twitch_chat_ws');

const connectOBSWebsocket = require("./obs_helper").connect;
const channelOut = process.env.CHANNEL;

// Define configuration options from env file
const client_config = {
    identity: {
        username: process.env.USER,
        password: process.env.OATH,
    },
    channels: [channelOut],
};

// Create a Twitch client with options
const client = new twitch_client.client(client_config);

// Setup data for twitch message commands
// message logic happens on twitch connection and on message
const messages_json = fs.readFileSync("timers.json");
let repeated_messages_out = JSON.parse(messages_json);

// Register event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

connectOBSWebsocket(); //connect to obs

function repeatedMessageSay(message) {
    if (message.countLines >= message.minLines) {
        message.countLines = 0;
        client.say(channelOut, message.message);
    }
}

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
    console.log(user_msg);

    //send message over websocket, frontend listening for messages
    twitch_chat_websocket.chat_client.send(`{"user": "${user_info.username}", "text": "${user_msg}"}`);

    //handle timer logic
    for (let message of repeated_messages_out.timers) {
        message.countLines = message.countLines + 1;
        if (message.prioritizeLines) {
            repeatedMessageSay(message);
        }
    }

    //pass the message into the bot
    let response_promise = bot.message_main(user_info, user_msg);
    response_promise.then(
        (result) => {
            if (result) client.say(channelOut, result);
        },
        (error) => console.log(error)
    );
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    for (let message of repeated_messages_out.timers) {
        message.countLines = 0;
        setInterval(() => {
            repeatedMessageSay(message);
        }, message.time * 1000);
    }
}
