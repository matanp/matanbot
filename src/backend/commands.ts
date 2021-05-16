import * as fs from "fs";
import * as admin from "firebase-admin";

import * as serviceAccount from "./matanbot-bab21-firebase-adminsdk-bsty9-9195f4ab44.json";

const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

admin.initializeApp({
  credential: admin.credential.cert(params),
  databaseURL: "https://matanbot-bab21-default-rtdb.firebaseio.com",
});

const db = admin.firestore();

export type Command = {
  command_word: string;
  response_array: string[];
  mod_only: boolean;
  added_by: string;
  added_timestamp: string;
  usage_count: number;
};

type FirebaseCollection =
  FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

//load commands from json file
export const loadCommands: () => Promise<Command[]> = async () => {
  console.log('loading commands from database');
  const chat_commands_collection: FirebaseCollection = await db
    .collection("chat_commands")
    .get();

  console.log('retrieved data');

  return chat_commands_collection.docs.map((doc) => {
    const data = doc.data();
    return {
      command_word: data.command_word,
      response_array: data.response_array,
      mod_only: data.mod_only,
      added_by: data.added_by,
      added_timestamp: data.added_timestamp,
      usage_count: data.usage_count,
    };
  });
};

//persist commands to store state when bot is off
export const saveCommands = (commands: Command[]) => {
  //fs.writeFileSync("commands.json", JSON.stringify({ commands: commands }));
  commands.forEach((command) =>
    db
      .collection("chat_commands")
      .doc(command.command_word)
      .set(command, { merge: true })
  );
};

export const findCommand = (command_word: string, commands: Command[]) => {
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

  db.collection("chat_commands")
    .doc(new_command.command_word)
    .set(new_command, { merge: true });

  return new_command;
};

//create new command with the new parameters
//but use original commands added_by, added_timestamp and usage_count
export const editCommand = (command: Command, user_parameters: string[]) => {
  const edited_command = newCommand(command.added_by, user_parameters);
  edited_command.added_timestamp = command.added_timestamp;
  edited_command.usage_count = command.usage_count;

  db.collection("chat_commands")
    .doc(edited_command.command_word)
    .set(edited_command, { merge: true });

  return edited_command;
};

//replace instances of {count} in the response_array w/command's usage count
//reduce array into a string and return
export const commandResponse = (command: Command) => {
  return command.response_array.reduce((cur_value, add_value) => {
    if (add_value === `{count}`) {
      return `${cur_value} ${command.usage_count}`;
    } else {
      return `${cur_value} ${add_value}`;
    }
  }, "");
};
