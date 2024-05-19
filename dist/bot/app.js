"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewBotInstance = void 0;
var discord_js_1 = require("discord.js");
var createNewBotInstance = function (token) {
    var client = new discord_js_1.Client({
        intents: [
            discord_js_1.IntentsBitField.Flags.Guilds,
            discord_js_1.IntentsBitField.Flags.GuildMessages,
            discord_js_1.IntentsBitField.Flags.MessageContent,
        ],
    }).on("ready", function () {
        var _a;
        console.log("Logged in as " + ((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag) + "!");
    });
    return client;
};
exports.createNewBotInstance = createNewBotInstance;
