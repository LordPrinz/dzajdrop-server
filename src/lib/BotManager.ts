import { Client } from "discord.js";
import { client } from "../../bot/app";
import { config } from "../config";

class BotManager {
	// This class will manage all the bots in the server.

	private bots: Client[] = [];
	private occupiedSlots: number[] = [];

	// This method will return the first available bot that has enough slots.
	private getAvailableBot(requiredSlots: number = 1) {
		for (let i = 0; i < this.bots.length; i++) {
			if (this.occupiedSlots[i] + requiredSlots <= config.botSlots) {
				this.occupiedSlots[i] += requiredSlots;
				return this.bots[i];
			}
		}
		return null;
	}

	constructor() {
		const { bots: botTokens } = config;

		for (const botToken of botTokens) {
			// Save bot instances to bots array.
			client.login(botToken).then(() => {
				this.bots.push(client);
				this.occupiedSlots.push(0);
			});
		}
	}

	public sendAttachment() {
		const bot = this.getAvailableBot();
		if (!bot) {
			// Handle the case when no bot is available.
		}
	}
}

export const botManager = new BotManager();
