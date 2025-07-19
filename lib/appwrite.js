import { Account, Client, Databases, ID } from "appwrite";

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.faithfulisuh.WordBits',
  projectId: '6838091d0019dd8a475e',
  databaseId: "6879ba3f00038819d75a",
  userCollectionId: "6879ba4e00244a1a8796",
  messagesCollectionId: "6879ba5d0019f094c679",
}

// Initialize Appwrite client with project settings
const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

// Initialize Appwrite services
const account = new Account(client);
const database = new Databases(client);

// Save user progress to Appwrite
export async function saveUserProgress(userId, progress) {
  try {
    // Use userId as documentId for easy lookup
    return await database.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      { progress }
    );
  } catch (error) {
    // If document does not exist, create it
    if (error.code === 404) {
      return await database.createDocument(
        config.databaseId,
        config.userCollectionId,
        userId,
        { progress },
        [`read("user:${userId}")`], // Read permission rule
        [`write("user:${userId}")`]  // Write permission rule
      );
    }
    throw error;
  }
}

// Load user progress from Appwrite
export async function loadUserProgress(userId) {
  try {
    const doc = await database.getDocument(
      config.databaseId,
      config.userCollectionId,
      userId
    );
    return doc.progress;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}
// Logout function: deletes the current session
export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.log('Error logging out:', error);
    // If the error is due to no current session, don't throw
    if (error.code === 401) {
      console.log('No active session to log out from');
      return;
    }
    throw error; // Throw other errors
  }
}


export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) throw Error('Account creation failed');

    // Try to sign in
    const session = await signIn(email, password);
    if (!session) throw Error('Login failed');

    // Only create the user document if login/session succeeded
    // Set permissions so the user can read/write their own document
    const documentId = ID.unique();
    const newUser = await database.createDocument(
      config.databaseId,
      config.userCollectionId,
      documentId,
      {
        accountId: newAccount.$id,
        email,
        username,
        progress: {} // Initialize empty progress
      },
      [`read("user:${newAccount.$id}")`], // Read permission rule
      [`write("user:${newAccount.$id}")`]  // Write permission rule
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