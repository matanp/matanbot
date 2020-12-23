'use strict';

var count = 0;

// Called every time a message comes in
function message_main (user_info, user_msg) {
  // Remove whitespace from chat message
  const commandName = user_msg.trim();

  const upper_case = commandName.toUpperCase();

  //random number 1 to 10
  const random_num = Math.floor((Math.random() * 10) + 1);
  let msg_out = "";

  if (upper_case.search("DISCORD") != -1) {
    return "Did someone say discord? Join Matan's discord to get updates on stream schedule, juggling advice, hangout and all around have a good time! https://discord.gg/bNUaFRE";
  }
  if (upper_case.search("MATANBOT") != -1) {
    count = count + 1;
    if (random_num > 9) {
      msg_out = "matanbot is currently under development, please excuse the lack of functionality"
    } else if (random_num > 8){
      msg_out = "I'm so glad someone recognizes my potential as being the best bot on the channel"
    } else if (random_num > 6) {
      msg_out = "I am a juggle bot, that is all I am"
    }
    else {
      msg_out = "hi " + user_info.username + "!"
    }
    if (count % 11 == 0) {
      return `yall said my name ${count.toString()} times? wow!`;
    } else {
      return msg_out;
    }
  }
}

module.exports = { bot: message_main }