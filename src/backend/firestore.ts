import admin from "firebase-admin";
import serviceAccount from "./matanbot-bab21-firebase-adminsdk-bsty9-9195f4ab44.json";

const params = {
  //clone json object into new object to make typescript happy
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
});

const db: FirebaseFirestore.Firestore = admin.firestore();

//every document in the chat_commands collection represents a single chat command
export const getCommands = async () => {
  const commands_ref = db.collection("chat_commands");
  const commands = await commands_ref.get();
  return commands.docs.map((command_doc) => command_doc.data());
};

//send usage to usage_count field of command doc
export const incrementCommandUsage = async (command_name: string) => {
    const doc_ref = db.collection('chat_commands').doc(command_name);
    await doc_ref.update({
        usage_count: admin.firestore.FieldValue.increment(1)
      });
}

//save command data, merge in case of editing command
export const saveCommand = async (command: any) => {
    await db.collection('chat_commands').doc(command.command_word).set(command, {merge: true});
}

//load each doc from chat_timers collection, and return as array of timers
export const getChatTimers = async () => {
  const timers_ref = db.collection('chat_timers');
  const timers = await timers_ref.get();
  return timers.docs.map((timer_doc) => timer_doc.data());

}

//initial loading of timers to database, unused
export const addChatTimer = async (timer: any) => {
  await db.collection('chat_timers').doc(timer.name).set(timer);
}
