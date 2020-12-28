"use strict";
const switchGreenScreenBG = require("./obs_helper.js").switchGreenScreenBG;

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

function changeGreenScreenBackground(image_request) {
  let images = [
    { obs_name: "pool", command_name: "pool" },
    { obs_name: "tile-gradient", command_name: "tile" },
    { obs_name: "earth stock", command_name: "earth" },
    { obs_name: "duck", command_name: "duck" },
    { obs_name: "universe 1", command_name: "universe" },
  ];

  let bg = "";

  images.forEach(function (image) {
    if (image_request === image.command_name) {
      bg = image.obs_name;
    }
  });
  if (bg != "") {
    try {
      switchGreenScreenBG(bg);
    } catch (err) {
      console.log(err);
    }
  } else {
    return `Possible backgrounds are, pool, tile, earth, duck, universe. E.g. !background duck`;
  }
}

// Called every time a message comes in
function message_main(user_info, user_msg) {
  // Remove whitespace from chat message
  const user_command = user_msg.trim().toLowerCase();

  if (user_command.search("discord") != -1) {
    return "Did someone say discord? Join Matan's discord to get updates on stream schedule, juggling advice, hangout and all around have a good time! https://discord.gg/bNUaFRE";
  }
  if (user_command.search("matanbot") != -1) {
    let msg_out = respondToMatanbotMention(user_info);
    if (msg_out) {
      return msg_out;
    }
  }
  const parameters = user_msg.split(" ").filter((n) => n);
  const command = parameters.shift().slice(1).toLowerCase();

  if (command === "background" || command === "bg") {
    let msg_out = changeGreenScreenBackground(parameters[0]);
    if (msg_out) {
      return msg_out;
    }
  }
}

module.exports = { message_main: message_main };
