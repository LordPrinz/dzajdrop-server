import { Client, IntentsBitField } from "discord.js";

export const createNewBotInstance = (token: string) => {
	const client = new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent,
		],
	}).on("ready", () => {
		console.log(`Logged in as ${client.user?.tag}!`);
	});
	return client;
};
