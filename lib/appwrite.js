// Logout function: deletes the current session
export async function logout() {
  try {
  await account.deleteSession('current');
  } catch (error) {
  console.log('Error logging out:', error);
  throw new Error(error);
  }
}
import { Account, Client, Databases, ID } from "appwrite";

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.faithfulisuh.WordBits',
  projectId: '6838091d0019dd8a475e',
  databaseId: "6879ba3f00038819d75a",
  userCollectionId: "6879ba4e00244a1a8796",
  messagesCollectionId: "6879ba5d0019f094c679",
}

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)


const account = new Account(client);
const database = new Databases(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) throw Error('Account creation failed');

    // Try to sign in
    const session = await signIn(email, password);
    if (!session) throw Error('Login failed');

    // Only create the user document if login/session succeeded
    // Set permissions so the user can read/write their own document
    const newUser = await database.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      { accountId: newAccount.$id, email, username },
      [
        `user:${newAccount.$id}` // read and write permission for the user
      ],
      [
        `user:${newAccount.$id}` // write permission for the user
      ]
    );

    return newUser;
  } catch (error) {
    console.log("Error creating user:");
    throw new Error(error);
  }
};

export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    if (!session) throw Error;
    return session;
  } catch (error) {
    console.log("Error signing in:");
    throw new Error(error);
  }
}