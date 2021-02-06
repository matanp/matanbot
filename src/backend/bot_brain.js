"use strict";
const obs = require("./obs_helper.js");
const consts = require("./consts.js");
const commands = require("./commands.js");
const { add } = require("winston");

let matanbot_mention_count = 0;
let mlk_quote_num = 0;

const added_commands = commands.loadCommands();

//every 5 minutes, save commands to persist usage counts
setInterval(() => commands.saveCommands(added_commands), 5 * 60 * 1000);

//logic for when matanbot is mentioned
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

//TODO: make not case sensitive
//logic for !bg / !background command
//if requested background exists, switch the background in OBS
const changeGreenScreenBackground = async (image_request) => {
    for (let image of consts.background_images) {
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
    return consts.backgrounds_help_message;
};

//logic for !mlk command
//return new quote everytime, looping when all quotes have been called
function get_mlk_quote() {
    mlk_quote_num = (mlk_quote_num + 1) % consts.mlk_quotes.length;
    return `${consts.mlk_quotes[mlk_quote_num]} - Martin Luther King Jr.`;
}

//logic for mod !add / !addBackground command
function addCommand(user_info, user_parameters) {
    if (user_parameters.length < 2) {
        return `Mods can add a command with !add {command} {response} {+m for mod only}`;
    }

    if (commands.findCommand(user_parameters[0], added_commands)) {
        return `!${user_parameters[0]} already exists. Use !edit to change it.`;
    }

    const new_command = commands.newCommand(user_info["display-name"], user_parameters);
    added_commands.push(new_command);
    commands.saveCommands(added_commands);
    return `Added !${new_command.command_word}`;
}

//logic for mod !edit / !editCommand command
function editCommand(user_parameters) {
    if (user_parameters.length < 2) {
        return `Mods can edit an existing command with !edit {command} {response} {+m for mod only}. Must add +m for command to stay mod only.`;
    }

    const edit_command_index = added_commands.indexOf(commands.findCommand(user_parameters[0], added_commands));

    if (edit_command_index === -1) {
        return `!${command_word} is not an existing command.`;
    }

    const edit_command = commands.editCommand(added_commands[edit_command_index], user_parameters);
    added_commands[edit_command_index] = edit_command;
    commands.saveCommands(added_commands);

    return `Edited !${edit_command.command_word}`;
}

// Called every time a message comes in
const message_main = async (user_info, user_msg) => {
    // Remove whitespace from chat message
    const user_text = user_msg.trim().toLowerCase();

    if (user_text.search("clap") != -1) {
        obs.showHeartEyes();
    }
    if (user_text.search("discord") != -1) {
        return "Did someone say discord? Join Matan's discord to get updates on stream schedule, juggling advice, hangout and all around have a good time! https://discord.gg/bNUaFRE";
    }
    if (user_text.search("matanbot") != -1) {
        return respondToMatanbotMention(user_info);
    }

    const user_parameters = user_msg.split(" ");
    const user_command = user_parameters.shift().toLowerCase();
    const mod_privileges =
        user_info.mod || user_info.badges?.broadcaster === `1`;

    if (user_command === "!background" || user_command === "!bg") {
        return await changeGreenScreenBackground(user_parameters[0]);
    }

    if (user_command === "!mlk") {
        return get_mlk_quote();
    }

    if (
        mod_privileges &&
        (user_command === `!add` || user_command === `!addCommand`)
    ) {
        return addCommand(user_info, user_parameters);
    }

    if (
        mod_privileges &&
        (user_command === `!edit` || user_command === `!editCommand`)
    ) {
        return editCommand(user_parameters);
    }

    //loop through commands
    for (let added_command of added_commands) {
        if (user_command === `!${added_command.command_word}`) {
            //user doesn't have privileges to call this command
            if(!mod_privileges && added_command.mod_only) {
                continue;
            }

            if (user_parameters[0] === `count`) {
                return `${user_command} has been used ${added_command.usage_count} times.`;
            } else if (user_parameters[0] === `age`) {
                return `${user_command} was added on ${added_command.added_date} by ${added_command.added_by}.`;
            } else {
                added_command.usage_count = added_command.usage_count + 1;

                return commands.commandResponse(added_command);
            }
        }
    }
};

module.exports = { message_main: message_main };
