import { type Client, TextChannel } from "discord.js";
import { client } from "../../bot/app";
import { config } from "../config";
import { type FileInfo } from "../types";

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
				return { bot: this.bots[i], id: i };
			}
		}
		return { bot: null, id: -1 };
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
						}
					});
					isDestinationChannelSet = true;
				}
				this.occupiedSlots.push(0);
			});
		}
	}

	// Method to send attachments that have less than size defined in config. (25MB is default)
	public async sendAttachment(filePath: string, fileInfo: FileInfo) {
		const { bot, id } = this.getAvailableBot(1);
		const channel = this.destinationChannel;

		if (!bot) {
			return;
		}
		if (!channel) {
			return;
		}

		const formatToEmbed = (filed: string | number) => {
			return `\`\`\`${filed}\`\`\``;
		};

		const content =
			formatToEmbed(fileInfo.fileName) +
			formatToEmbed(fileInfo.extension) +
			formatToEmbed(new Date().getTime());

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
}

export const botManager = new BotManager();
