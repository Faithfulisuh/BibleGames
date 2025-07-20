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
  if (!userId) {
    throw new Error('User ID is required to save progress');
  }

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

  const progressDataToSave = {
    userId: userId,
    progress: JSON.stringify([safeProgress]),
    lastUpdated: new Date().toISOString()
  };

  try {
    // First try to update existing document
    return await database.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      progressDataToSave
    );
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === 404 || error.code === 'document_not_found') {
      try {
        return await database.createDocument(
          config.databaseId,
          config.userCollectionId,
          userId,
          {
            ...progressDataToSave,
            // Add any additional required fields here
          },
          [
            `read("user:${userId}")`,
            `update("user:${userId}")`,
            `delete("user:${userId}")`
          ]
        );
      } catch (createError) {
        if (createError.code === 409) {
          // Document was created by another request, try updating again
          return await database.updateDocument(
            config.databaseId,
            config.userCollectionId,
            userId,
            progressDataToSave
          );
        }
        throw createError;
      }
    }
    throw error;
  }
}

// Load user progress
export async function loadUserProgress(userId) {
  if (!userId) {
    // Return default state if no user ID is provided
    return getDefaultGameState();
  }

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
        // If there's an error parsing, return default state and save it
        const defaultState = getDefaultGameState();
        await saveUserProgress(userId, defaultState);
        return defaultState;
      }
    }
    
    // If no progress exists, create default progress
    const defaultState = getDefaultGameState();
    await saveUserProgress(userId, defaultState);
    return defaultState;
    
  } catch (error) {
    if (error.code === 404 || error.code === 'document_not_found') {
      // If document doesn't exist, create it with default values
      const defaultState = getDefaultGameState();
      try {
        await saveUserProgress(userId, defaultState);
      } catch (saveError) {
        // If we can't save, just return the default state
      }
      return defaultState;
    }
    
    // For other errors, return default state
    return getDefaultGameState();
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
    
    try {
      // Try to load user progress, but don't fail if it doesn't exist yet
      await loadUserProgress(userId);
    } catch (progressError) {
      // If there's an error loading progress, create a default progress document
      if (progressError.code === 404 || progressError.code === 'document_not_found') {
        await saveUserProgress(userId, getDefaultGameState());
      } else {
        // Re-throw other errors
        throw progressError;
      }
    }
    
    return session;
  } catch (error) {
    // Map common error codes to more user-friendly messages
    if (error.code === 401) {
      error.message = 'Invalid email or password. Please try again.';
    } else if (error.code === 429) {
      error.message = 'Too many attempts. Please try again later.';
    } else if (!error.message) {
      error.message = 'An unknown error occurred during sign in.';
    }
    throw error;
  }
}
