"use strict";
/* global process */
require("dotenv").config();
const fs = require("fs");

//twitch client
const twitch_client = require("tmi.js");

//and we need the bot
const bot = require("./bot_brain.js");

const connectOBSWebsocket = require("./obs_helper").connect;

const channelOut = process.env.CHANNEL;

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

// Setup data for twitch timer commands
// Timer logic happens on twitch connection and on message
const rawdata = fs.readFileSync("timers.json");
let timer_data = JSON.parse(rawdata);

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
    console.log(user_msg);

    //handle timer logic
    for (let timer of timer_data.timers) {
        timer.countLines = timer.countLines + 1;
        if (timer.prioritizeLines && timer.countLines > timer.minLines) {
            timer.countLines = 0;
            client.say(channelOut, timer.message);
        }
    }

    //pass the message into the bot
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
    for (let timer of timer_data.timers) {
        timer.countLines = 0;
        setInterval(() => {
            if (timer.countLines >= timer.minLines) {
                timer.countLines = 0;
                client.say(channelOut, timer.message);
            }
        }, timer.time * 1000);
    }
}
