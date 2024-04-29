import { Attachment, Client, TextChannel } from "discord.js";
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
	public async sendSmallAttachment(filePath: string, fileName: string) {
		// TODO: Implement attachment type.
		const bot = this.getAvailableBot(1);
		const channel = this.destinationChannel;

		if (!bot) {
			//TODO: Handle the case when no bot is available.
			return;
		}
		if (!channel) {
			//TODO: Handle the case when no chat is available.
			return;
		}

		const response = await channel.send({ content: fileName, files: [filePath] });
		return response;
	}
}

export const botManager = new BotManager();
