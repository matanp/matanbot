import fs from "fs";

import * as firestore from "./firestore";

export type Command = {
  command_word: string;
  response_array: string[];
  mod_only: boolean;
  added_by: string;
  added_timestamp: string;
  usage_count: number;
};

//load commands from json file
export const loadCommands = async () => {
  //const commands_json = String(fs.readFileSync("commands.json"));
  //return JSON.parse(commands_json).commands;
  const commands = await firestore.getCommands();
  return commands.map((command_data) => ({
    command_word: command_data.command_word,
    response_array: command_data.response_array,
    mod_only: command_data.mod_only,
    added_by: command_data.added_by,
    added_timestamp: command_data.added_timestamp,
    usage_count: command_data.usage_count,
  }));
};

export const findCommand = (
  command_word: string,
  commands: Command[]
): Command => {
  return commands.find(
    (command: Command) => command.command_word === command_word
  );
};

//creates a new command initialized on today's date
//added by added_by_user, set usage_count to 0
export const newCommand = (
  added_by_user: string,
  user_parameters: string[]
) => {
  const now = new Date(Date.now());
  const mod_only = user_parameters[user_parameters.length - 1] === `+m`;
  if (mod_only) {
    user_parameters.pop(); //remove +m from response message
  }

  const new_command = {
    command_word: user_parameters.shift(),
    response_array: user_parameters,
    mod_only: mod_only,
    added_by: added_by_user,
    added_timestamp: `${
      now.getMonth() + 1
    }-${now.getDate()}, ${now.getFullYear()}`,
    usage_count: 0,
  };

  firestore.saveCommand(new_command);
  return new_command;
};

//create new command with the new parameters
//but use original commands added_by, added_timestamp and usage_count
export const editCommand = (command: Command, user_parameters: string[]) => {
  const edited_command = newCommand(command.added_by, user_parameters);
  edited_command.added_timestamp = command.added_timestamp;
  edited_command.usage_count = command.usage_count;
  firestore.saveCommand(edited_command);
  return edited_command;
};

//replace instances of {count} in the response_array w/command's usage count
//reduce array into a string and return
export const commandResponse = (command: Command) => {
  //send usage to db, this function only gets called when command gets used
  firestore.incrementCommandUsage(command.command_word);
  return command.response_array.reduce((cur_value, add_value) => {
    if (add_value === `{count}`) {
      return `${cur_value} ${command.usage_count}`;
    } else {
      return `${cur_value} ${add_value}`;
    }
  }, "");
};
