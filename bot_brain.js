"use strict";
const obs = require("./obs_helper.js");

let matanbot_mention_count = 0;

function respondToMatanbotMention(user_info) {
    //random number 1 to 10
    const random_num = Math.floor(Math.random() * 10 + 1);
    let msg_out = "";

    matanbot_mention_count = matanbot_mention_count + 1;
    if (random_num > 9) {
        msg_out =
            "matanbot is currently under development, please excuse the lack of functionality";
    } else if (random_num > 8) {
        msg_out =
            "I'm so glad someone recognizes my potential as being the best bot on the channel";
    } else if (random_num > 6) {
        msg_out = "I am a juggle bot, that is all I am";
    } else {
        msg_out = "hi " + user_info.username + "!";
    }
    if (matanbot_mention_count % 11 == 0) {
        return `yall said my name ${count.toString()} times? wow!`;
    } else {
        return msg_out;
    }
}

//make not case sensitive
const changeGreenScreenBackground = async (image_request) => {
    let images = [
        { obs_name: "pool", command_name: "pool" },
        { obs_name: "tile-gradient", command_name: "tile" },
        { obs_name: "earth stock", command_name: "earth" },
        { obs_name: "duck", command_name: "duck" },
        { obs_name: "universe 1", command_name: "universe" },
        { obs_name: "invisible", command_name: "invisible" },
        { obs_name: "tornado", command_name: "fire" },
        { obs_name: "rainbow", command_name: "rainbow" }
    ];

    for (let image of images) {
        if (image_request === image.command_name) {
            try {
                if (await obs.switchGreenScreenBG(image.obs_name)) {
                    return `Background has been changed.`;
                } else {
                    return `Cannot change background right now.`;
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    //cannot find matching image, tell user what possible image names are
    return `Possible backgrounds are, pool, tile, earth, duck, universe, invisible, fire, rainbow. E.g. !background duck`;
}

// Called every time a message comes in
const message_main = async (user_info, user_msg) => {
    // Remove whitespace from chat message
    const user_command = user_msg.trim().toLowerCase();

    if (user_command.search("clap") != -1) {
        obs.showHeartEyes();
    }
    if (user_command.search("discord") != -1) {
        return "Did someone say discord? Join Matan's discord to get updates on stream schedule, juggling advice, hangout and all around have a good time! https://discord.gg/bNUaFRE";
    }
    if (user_command.search("matanbot") != -1) {
        return respondToMatanbotMention(user_info);
    }
    const parameters = user_msg.split(" ");
    const command = parameters.shift().toLowerCase();

    if (command === "!background" || command === "!bg") {
        return await changeGreenScreenBackground(parameters[0]);
    }
}

module.exports = { message_main: message_main };
