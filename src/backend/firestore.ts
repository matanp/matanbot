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

export const incrementCommandUsage = async (command_name: string) => {
    const doc_ref = db.collection('chat_commands').doc(command_name);
    await doc_ref.update({
        usage_count: admin.firestore.FieldValue.increment(1)
      });
}

export const saveCommand = async (command: any) => {
    await db.collection('chat_commands').doc(command.command_word).set(command, {merge: true});
}
