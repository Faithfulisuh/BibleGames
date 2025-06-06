import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Client, Functions } from 'appwrite'; // Import Appwrite SDK

// Define the Appwrite client configuration
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('6838091d0019dd8a475e'); // Replace with your Appwrite project ID

// Initialize the Functions service
const functions = new Functions(client);

// Define the component
const AppwritePing: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to execute the ping
  const sendPing = async () => {
    try {
      // Assuming you have a 'ping' function deployed in Appwrite
      const execution = await functions.createExecution(
        'YOUR_FUNCTION_ID', // Replace with your Appwrite function ID
        JSON.stringify({ message: 'Ping from React Native!' }) // Optional data payload
      );
      setResponse(JSON.stringify(execution.response));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setResponse(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appwrite Ping Test</Text>
      <Button title="Send Ping" onPress={sendPing} />
      {response && (
        <Text style={styles.response}>Response: {response}</Text>
      )}
      {error && (
        <Text style={styles.error}>Error: {error}</Text>
      )}
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  response: {
    marginTop: 20,
    color: 'green',
  },
  error: {
    marginTop: 20,
    color: 'red',
  },
});

export default AppwritePing;
