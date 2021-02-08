//https://dev.twitch.tv/docs/pubsub
require("dotenv").config();
const WebSocket = require("ws");

let ws;

connect();

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


//all wrapped in a function to handle reconnecting
function connect() {
    ws = new WebSocket("wss://pubsub-edge.twitch.tv");

    //TODO reconnect if don't receive PONG back from PING
    ws.onopen = function (event) {
        console.log('opened');
        //ping server every 4.5 - 4.55 minutes
        //randomness since Twitch asked nicely
        (function heartbeat() {
            let rand = 1000 * 60 * 4.5 + (Math.random() * 5000);
            setTimeout(function () {
                ws.send(`{ "type": "PING" }`);
                heartbeat();
            }, rand);
        })();

        //stuck on getting channel id of my channel, this one incorrect
        const listen_to_topics = {
            "type": "LISTEN",
            "nonce": randomString(17),
            "data": {
                "topics": ["channel-points-channel-v1.128811347"],
                "auth_token": process.env.OATH
            }
    
        }

        ws.send(`${listen_to_topics}`);
    };

    ws.onerror = function(error) {
        console.log(error);
    };

    //TODO handle RECONNECT messages from server
    ws.onmessage = function(event) {
        console.log(event.data.trim());
    };
}
