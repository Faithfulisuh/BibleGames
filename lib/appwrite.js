import { Account, Client, Databases, ID } from "appwrite";

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.faithfulisuh.WordBits',
  projectId: '6838091d0019dd8a475e',
  databaseId: "6879ba3f00038819d75a",
  userCollectionId: "6879ba4e00244a1a8796",
  messagesCollectionId: "6879ba5d0019f094c679",
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const account = new Account(client);
const database = new Databases(client);

// Initialize default game state as an array with one game state object
const getDefaultGameState = () => [{
  level: 1,
  totalScore: 0,
  streak: 0,
  matchedVerses: [],
  achievements: [],
  lastPlayed: new Date().toISOString()
}];

// Save user progress
export async function saveUserProgress(userId, progress) {
  try {
    // Ensure progress is properly formatted
    const progressData = {
      ...getDefaultGameState()[0],
      ...(Array.isArray(progress) ? progress[0] : progress || {})
    };

    // Ensure all required fields are present
    const safeProgress = {
      level: Number(progressData.level) || 1,
      totalScore: Number(progressData.totalScore) || 0,
      streak: Number(progressData.streak) || 0,
      matchedVerses: Array.isArray(progressData.matchedVerses) ? progressData.matchedVerses : [],
      achievements: Array.isArray(progressData.achievements) ? progressData.achievements : [],
      lastPlayed: progressData.lastPlayed || new Date().toISOString()
    };

    // First try to update existing document
    return await database.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      {
        progress: JSON.stringify([safeProgress]), // Always stringify the progress
        lastUpdated: new Date().toISOString()
      }
    );
  } catch (error) {
    // If document doesn't exist, create it with default values
    if (error.code === 404 || error.code === 'document_not_found') {
        const defaultState = getDefaultGameState();
        // The createUser function should have already handled this,
        // but as a fallback, we can create it here.
        return await createUser(null, null, null, userId, defaultState);
    }
    console.error('Error saving user progress:', error);
    throw error;
  }
}

// Load user progress
export async function loadUserProgress(userId) {
  try {
    const doc = await database.getDocument(
      config.databaseId,
      config.userCollectionId,
      userId
    );
    
    // Parse the progress if it's a string, otherwise use as is or return default
    let progress = getDefaultGameState();
    
    if (doc?.progress) {
      try {
        const parsed = typeof doc.progress === 'string' ? JSON.parse(doc.progress) : doc.progress;
        if (Array.isArray(parsed) && parsed.length > 0) {
          progress = [{
            level: Number(parsed[0].level) || 1,
            totalScore: Number(parsed[0].totalScore) || 0,
            streak: Number(parsed[0].streak) || 0,
            matchedVerses: Array.isArray(parsed[0].matchedVerses) ? parsed[0].matchedVerses : [],
            achievements: Array.isArray(parsed[0].achievements) ? parsed[0].achievements : [],
            lastPlayed: parsed[0].lastPlayed || new Date().toISOString()
          }];
        }
        return progress;
      } catch (e) {
        console.error('Error parsing progress:', e);
        // If there's an error parsing, return default state and save it
        const defaultState = getDefaultGameState();
        await saveUserProgress(userId, defaultState);
        return defaultState;
      }
    }
    
    // If no progress exists, initialize it
    const defaultState = getDefaultGameState();
    await saveUserProgress(userId, defaultState);
    return defaultState;
    
  } catch (error) {
    // If document doesn't exist, create one with default progress
    if (error.code === 404 || error.code === 'document_not_found') {
      const defaultState = getDefaultGameState();
      await saveUserProgress(userId, defaultState);
      return defaultState;
    }
    
    console.error('Error loading user progress:', error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (error) {
    if (error.code === 401) {
      console.log('No active session to log out from');
      return;
    }
    throw error;
  }
}

// Create user and document
export const createUser = async (email, password, username) => {
  let user;
  try {
    // Try to create an account
    user = await account.create(ID.unique(), email, password, username);
  } catch (error) {
    if (error.code === 409) { // User already exists
      console.log("User already exists, attempting to sign in.");
      // If user exists, sign in to get the user object
      await signIn(email, password);
      user = await account.get();
    } else {
      console.error("Account creation error:", error.message);
      throw error;
    }
  }

  const userId = user.$id;
  console.log("Authenticated as:", userId);

  // Check if user document already exists
  try {
    await database.getDocument(config.databaseId, config.userCollectionId, userId);
    console.log("User document already exists, skipping creation.");
    return;
  } catch (error) {
    // Document does not exist, so we create it
    if (error.code !== 404 && error.code !== 'document_not_found') {
      console.error("Error checking for user document:", error);
      throw error;
    }
  }

  // Initialize default game state for the user and STRINGIFY it
  const defaultGameState = getDefaultGameState();
  const progressString = JSON.stringify(defaultGameState);

  try {
    // Create the document without a permissions array.
    // It will inherit the collection-level permissions (e.g., 'any').
    const newUserDoc = await database.createDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      {
        userID: userId,
        username: username,
        progress: progressString, // Pass the stringified progress
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
      // The permissions array has been removed from here.
    );
    
    console.log("Created new user document with default game state");
    return newUserDoc;
    
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

// Sign in
export async function signIn(email, password) {
  try {
    // Create a new session
    const session = await account.createEmailPasswordSession(email, password);
    
    // Get the user's ID
    const user = await account.get();
    const userId = user.$id;
    
    // Ensure the user's document exists and has valid progress
    await loadUserProgress(userId);
    
    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}
