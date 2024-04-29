import { Client, TextChannel } from "discord.js";
import { client } from "../../bot/app";
import { config } from "../config";

// This class will manage all the bots in the server.
class BotManager {
	private bots: Client[] = [];
	private occupiedSlots: number[] = [];

	private destinationChannel: TextChannel | null = null;

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

		let isDestinationChannelSet = false;

		for (const botToken of botTokens) {
			// Save bot instances to bots array.
			client.login(botToken).then(() => {
				this.bots.push(client);

				// Set the destination channel.
				if (!isDestinationChannelSet) {
					client.channels.fetch(config.channelId).then((channel) => {
						if (channel instanceof TextChannel) {
							this.destinationChannel = channel;
						} else {
							//TODO: Handle the case when the channel is not a text channel.
						}
					});
					isDestinationChannelSet = true;
				}
				this.occupiedSlots.push(0);
			});
		}
	}

	// Method to send attachments that have less than size defined in config. (25MB is default)
	public async sendSmallAttachment() {
		// TODO: Implement attachment type.
		const bot = this.getAvailableBot(1);
		if (!bot) {
			//TODO: Handle the case when no bot is available.
		}
	}

	// Method to send attachments that have more than size defined in config. (25MB is default)
	public async sendLargeAttachment() {
		const bot = this.getAvailableBot();
		if (!bot) {
			//TODO: Handle the case when no bot is available.
		}
	}
}

export const botManager = new BotManager();
