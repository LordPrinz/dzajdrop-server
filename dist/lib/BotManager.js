"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botManager = void 0;
var discord_js_1 = require("discord.js");
var app_1 = require("../bot/app");
var config_1 = require("../config");
// This class will manage all the bots in the server.
var BotManager = /** @class */ (function () {
    function BotManager() {
        var _this = this;
        this.bots = [];
        this.occupiedSlots = [];
        this.destinationChannel = null;
        var botTokens = config_1.config.bots;
        var isDestinationChannelSet = false;
        for (var _i = 0, botTokens_1 = botTokens; _i < botTokens_1.length; _i++) {
            var botToken = botTokens_1[_i];
            // Save bot instances to bots array.
            app_1.client.login(botToken).then(function () {
                _this.bots.push(app_1.client);
                // Set the destination channel.
                if (!isDestinationChannelSet) {
                    app_1.client.channels.fetch(config_1.config.channelId).then(function (channel) {
                        if (channel instanceof discord_js_1.TextChannel) {
                            _this.destinationChannel = channel;
                        }
                    });
                    isDestinationChannelSet = true;
                }
                _this.occupiedSlots.push(0);
            });
        }
    }
    // This method will return the first available bot that has enough slots.
    BotManager.prototype.getAvailableBot = function (requiredSlots) {
        if (requiredSlots === void 0) { requiredSlots = 1; }
        for (var i = 0; i < this.bots.length; i++) {
            if (this.occupiedSlots[i] + requiredSlots <= config_1.config.botSlots) {
                this.occupiedSlots[i] += requiredSlots;
                return { bot: this.bots[i], id: i };
            }
        }
        return { bot: null, id: -1 };
    };
    // Method to send attachments that have less than size defined in config. (25MB is default)
    BotManager.prototype.sendAttachment = function (filePath, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, bot, id, channel, formatToEmbed, content, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getAvailableBot(1), bot = _a.bot, id = _a.id;
                        channel = this.destinationChannel;
                        if (!bot) {
                            return [2 /*return*/];
                        }
                        if (!channel) {
                            return [2 /*return*/];
                        }
                        formatToEmbed = function (filed) {
                            return "```" + filed + "```";
                        };
                        content = formatToEmbed(fileName);
                        return [4 /*yield*/, channel.send({
                                content: content,
                                files: [filePath],
                            })];
                    case 1:
                        response = _b.sent();
                        this.occupiedSlots[id] -= 1;
                        return [2 /*return*/, response];
                }
            });
        });
    };
    BotManager.prototype.deleteMessage = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, bot, id, channel, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getAvailableBot(0), bot = _a.bot, id = _a.id;
                        channel = this.destinationChannel;
                        if (!bot) {
                            return [2 /*return*/];
                        }
                        if (!channel) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, channel.messages.fetch(messageId)];
                    case 1:
                        message = _b.sent();
                        if (!message) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, message.delete()];
                    case 2:
                        _b.sent();
                        this.occupiedSlots[id] -= 1;
                        return [2 /*return*/];
                }
            });
        });
    };
    BotManager.prototype.getAttachment = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, bot, id, channel, message, attachment, url;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getAvailableBot(0), bot = _a.bot, id = _a.id;
                        channel = this.destinationChannel;
                        if (!bot) {
                            return [2 /*return*/];
                        }
                        if (!channel) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, channel.messages.fetch(messageId)];
                    case 1:
                        message = _b.sent();
                        if (!message) {
                            return [2 /*return*/];
                        }
                        attachment = message.attachments.first();
                        if (!attachment) {
                            return [2 /*return*/];
                        }
                        url = attachment.url;
                        this.occupiedSlots[id] -= 1;
                        return [2 /*return*/, url];
                }
            });
        });
    };
    return BotManager;
}());
exports.botManager = new BotManager();
