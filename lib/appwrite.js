import { Account, Client, ID } from "react-native-appwrite";

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
	.setPlatform(config.platform)


const account = new Account(client);

export const createUser = () => {
	account.create(ID.unique(), "me@example.com", "password123", "John Doe")
		.then(function (response) {
			console.log(response);
		}, function (error) {
			console.log(error);
		});
}