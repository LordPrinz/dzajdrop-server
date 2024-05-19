"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = require("dotenv");
dotenv_1.config();
exports.config = {
    uploadBytesLimit: Math.floor(24.84 * 1024 * 1024),
    bots: [process.env.BOT1_TOKEN],
    botSlots: 40,
    serverId: process.env.SERVER_ID,
    channelId: process.env.CHANNEL_ID,
};
