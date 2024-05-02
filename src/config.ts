import { config as cnf } from "dotenv";

cnf();

export const config = {
	uploadBytesLimit: Math.floor(24.84 * 1024 * 1024),
	bots: [process.env.BOT1_TOKEN!],
	botSlots: 40,
	serverId: process.env.SERVER_ID!,
	channelId: process.env.CHANNEL_ID!,
} as const;
