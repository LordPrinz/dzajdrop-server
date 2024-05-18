import { type Client, TextChannel } from "discord.js";
import { config } from "../config";
import { createNewBotInstance } from "../bot/app";

// This class will manage all the bots in the server.
class BotManager {
	private bots: Client[] = [];
	private occupiedSlots: number[] = [];

	private destinationChannel: TextChannel | null = null;

	public getAvailableBot(requiredSlots: number = 1) {
		let availableBotIndex = -1;

		for (let i = 0; i < this.bots.length; i++) {
			if (
				this.occupiedSlots[i] < config.botSlots &&
				this.occupiedSlots[i] + requiredSlots <= config.botSlots
			) {
				availableBotIndex = i;
				break;
			}
		}

		if (availableBotIndex === -1) {
			return { bot: null, id: -1, slots: -1 };
		}

		this.occupiedSlots[availableBotIndex] += requiredSlots;

		return {
			bot: this.bots[availableBotIndex],
			id: availableBotIndex,
			slots: config.botSlots - this.occupiedSlots[availableBotIndex],
		};
	}

	constructor() {
		const { bots: botTokens } = config;

		let isDestinationChannelSet = false;

		for (const botToken of botTokens) {
			const client = createNewBotInstance(botToken);
			// Save bot instances to bots array.
			client.login(botToken).then(() => {
				this.bots.push(client);

				// Set the destination channel.
				if (!isDestinationChannelSet) {
					client.channels.fetch(config.channelId).then((channel) => {
						if (channel instanceof TextChannel) {
							this.destinationChannel = channel;
						}
					});
					isDestinationChannelSet = true;
				}
				this.occupiedSlots.push(0);
			});
		}
	}

	// Method to send attachments that have less than size defined in config. (25MB is default)
	public async sendAttachment(filePath: string, fileName: string) {
		const { bot, id } = this.getAvailableBot(1);
		const channel = this.destinationChannel;

		if (!bot) {
			return null;
		}
		if (!channel) {
			return null;
		}

		const formatToEmbed = (filed: string | number) => {
			return `\`\`\`${filed}\`\`\``;
		};

		const content = formatToEmbed(fileName);
		const response = await channel.send({
			content,
			files: [filePath],
		});

		this.occupiedSlots[id] -= 1;

		return response;
	}

	public async deleteMessage(messageId: string) {
		const { bot, id } = this.getAvailableBot(0);
		const channel = this.destinationChannel;

		if (!bot) {
			return;
		}

		if (!channel) {
			return;
		}

		const message = await channel.messages.fetch(messageId);

		if (!message) {
			return;
		}

		await message.delete();

		this.occupiedSlots[id] -= 1;
	}

	public async getAttachment(messageId: string) {
		const { bot, id } = this.getAvailableBot(0);
		const channel = this.destinationChannel;

		if (!bot) {
			return;
		}

		if (!channel) {
			return;
		}

		const message = await channel.messages.fetch(messageId);

		if (!message) {
			return;
		}

		const attachment = message.attachments.first();

		if (!attachment) {
			return;
		}

		const url = attachment.url;

		this.occupiedSlots[id] -= 1;

		return url;
	}
}

export const botManager = new BotManager();
