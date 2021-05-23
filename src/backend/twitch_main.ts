"use strict";
/* global process */
require("dotenv").config();

//twitch client
import twitch_client from 'tmi.js'

//and we need the bot
import * as bot from "./bot_brain.js";

//databse functions 
import * as firestore from './firestore';

import * as twitch_chat_websocket from './twitch_chat_ws';

const connectOBSWebsocket = require("./obs_helper").connect;
const channelOut : string = process.env.CHANNEL || '';

// Define configuration options from env file
const client_config = {
    identity: {
        username: process.env.USER,
        password: process.env.OATH,
    },
    channels: [channelOut],
};

// Create a Twitch client with options
const client : twitch_client.Client = new twitch_client.client(client_config);

// Setup data for twitch message commands
// message logic happens on twitch connection and on message
let repeated_messages_out: any = [];
(async () => repeated_messages_out = await firestore.getChatTimers())();

// Register event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

connectOBSWebsocket(); //connect to obs

function repeatedMessageSay(message : any) {
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
function onMessageHandler(target_channel : string, user_info : any, user_msg : string, from_self : boolean) {
    if (from_self) {
        return;
    }
    console.log(user_msg);

    //send message over websocket, frontend listening for messages
    twitch_chat_websocket.chat_client.send(`{"user": "${user_info.username}", "text": "${user_msg}"}`);

    //handle timer logic
    for (let message of repeated_messages_out) {
        message.countLines = message.countLines + 1;
        if (message.prioritizeLines) {
            repeatedMessageSay(message);
        }
    }

    //pass the message into the bot
    let response_promise = bot.message_main(user_info, user_msg);
    response_promise.then(
        (result:string) => {
            if (result) client.say(channelOut, result);
        },
        (error: Error) => console.log(error)
    );
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr : string, port: number) {
    console.log(`* Connected to ${addr}:${port}`);
    for (let message of repeated_messages_out) {
        message.countLines = 0;
        setInterval(() => {
            repeatedMessageSay(message);
        }, message.time * 1000);
    }
}
