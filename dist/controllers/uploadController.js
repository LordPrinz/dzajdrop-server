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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
var config_1 = require("../config");
var fs_1 = __importDefault(require("fs"));
var BotManager_1 = require("../lib/BotManager");
var Database_1 = require("../lib/Database");
var utils_1 = require("../utils");
var setHeaders = function (res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
};
var uploadController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var messageIds, originalFileSize, uploadToDiscordHandler, uploadBytesLimit, busboy, approximateFileSize, tempFolderPath, totalBytesReceived, fileStream, fileIndex, calculateProgress, streamResponse, sendProgressResponse;
    return __generator(this, function (_a) {
        messageIds = [];
        originalFileSize = 0;
        uploadToDiscordHandler = function (path, fileName) { return __awaiter(void 0, void 0, void 0, function () {
            var discordRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, BotManager_1.botManager.sendAttachment(path, fileName)];
                    case 1:
                        discordRes = _a.sent();
                        if (!(discordRes === null || discordRes === void 0 ? void 0 : discordRes.id)) {
                            return [2 /*return*/];
                        }
                        originalFileSize += utils_1.calculateFileSize(path);
                        messageIds.push(discordRes.id);
                        fs_1.default.unlinkSync(path);
                        return [2 /*return*/];
                }
            });
        }); };
        uploadBytesLimit = config_1.config.uploadBytesLimit;
        busboy = req.busboy;
        if (!busboy) {
            return [2 /*return*/, res.status(400).send("No file provided")];
        }
        approximateFileSize = parseInt(req.headers["content-length"] || "0", 10);
        setHeaders(res);
        req.pipe(busboy);
        tempFolderPath = utils_1.createTempDirectory();
        totalBytesReceived = 0;
        fileStream = null;
        fileIndex = 0;
        calculateProgress = function () {
            var progress = Math.ceil(((fileIndex * uploadBytesLimit + totalBytesReceived) / approximateFileSize) *
                100);
            return progress;
        };
        streamResponse = function (data) {
            res.write("data: " + JSON.stringify(data) + "\n\n");
        };
        sendProgressResponse = function () {
            var progress = calculateProgress();
            streamResponse({ progress: progress });
        };
        busboy.on("file", function (_, file, fileInfo) {
            sendProgressResponse();
            var fileName = fileInfo.filename;
            totalBytesReceived = 0;
            fileStream = fs_1.default.createWriteStream(tempFolderPath + "/chunk-" + fileIndex + ".dzaj");
            file.on("data", function (data) { return __awaiter(void 0, void 0, void 0, function () {
                var overflowBytes, actualDataBytes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            totalBytesReceived += data.length;
                            if (!fileStream) {
                                return [2 /*return*/];
                            }
                            if (totalBytesReceived <= uploadBytesLimit) {
                                return [2 /*return*/, fileStream.write(data)];
                            }
                            file.pause();
                            overflowBytes = totalBytesReceived - uploadBytesLimit;
                            actualDataBytes = data.slice(0, data.length - overflowBytes);
                            fileStream.write(actualDataBytes);
                            fileStream.end();
                            return [4 /*yield*/, uploadToDiscordHandler(tempFolderPath + "/chunk-" + fileIndex + ".dzaj", fileName)];
                        case 1:
                            _a.sent();
                            fileIndex++;
                            fileStream = fs_1.default.createWriteStream(tempFolderPath + "/chunk-" + fileIndex + ".dzaj");
                            fileStream.write(data.slice(data.length - overflowBytes));
                            totalBytesReceived = data.length - overflowBytes;
                            file.resume();
                            sendProgressResponse();
                            return [2 /*return*/];
                    }
                });
            }); });
            file.on("end", function () { return __awaiter(void 0, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (fileStream) {
                                fileStream.end();
                            }
                            return [4 /*yield*/, uploadToDiscordHandler(tempFolderPath + "/chunk-" + fileIndex + ".dzaj", fileName)];
                        case 1:
                            _a.sent();
                            fs_1.default.rmSync(tempFolderPath, { recursive: true });
                            return [4 /*yield*/, Database_1.database.saveFile({
                                    fileName: fileName,
                                    size: originalFileSize,
                                    messageIds: messageIds,
                                })];
                        case 2:
                            response = _a.sent();
                            totalBytesReceived = 0;
                            messageIds.length = 0;
                            originalFileSize = 0;
                            if (!response) {
                                streamResponse({
                                    status: "fail",
                                    message: "Something went wrong!",
                                    progress: 0,
                                });
                                return [2 /*return*/, res.end()];
                            }
                            streamResponse({
                                status: "success",
                                message: "Upload finished!",
                                fileId: response.id,
                                secretKey: response.secretKey,
                                progress: 100,
                            });
                            res.end();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        req.on("close", function () { return __awaiter(void 0, void 0, void 0, function () {
            var progress, filePath, _i, messageIds_1, messageId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        progress = calculateProgress();
                        if (progress === 100) {
                            return [2 /*return*/];
                        }
                        if (fileStream) {
                            fileStream.close();
                            filePath = fileStream.path;
                            fileStream.destroy();
                            fs_1.default.unlink(filePath, function () {
                                fs_1.default.rmSync(tempFolderPath, { recursive: true });
                            });
                        }
                        else {
                            if (fs_1.default.existsSync(tempFolderPath)) {
                                fs_1.default.rmSync(tempFolderPath, { recursive: true });
                            }
                        }
                        _i = 0, messageIds_1 = messageIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < messageIds_1.length)) return [3 /*break*/, 6];
                        messageId = messageIds_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, BotManager_1.botManager.deleteMessage(messageId)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error deleting message " + messageId + ":", error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        totalBytesReceived = 0;
                        messageIds.length = 0;
                        originalFileSize = 0;
                        busboy.removeAllListeners();
                        return [2 /*return*/];
                }
            });
        }); });
        busboy.on("error", function (err) {
            streamResponse({
                status: "fail",
                message: "Something went wrong!",
                progress: 0,
            });
            res.end();
            console.error(err);
        });
        return [2 /*return*/];
    });
}); };
exports.uploadController = uploadController;
