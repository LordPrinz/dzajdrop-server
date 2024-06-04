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
exports.getFile = exports.getFileInfo = exports.deleteFile = void 0;
var axios_1 = __importDefault(require("axios"));
var utils_1 = require("../utils");
var BotManager_1 = require("../lib/BotManager");
var db_1 = require("../db");
var deleteFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fileId, secretKey, file;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileId = req.params.id;
                secretKey = req.body.secretKey;
                if (!secretKey) {
                    return [2 /*return*/, utils_1.sendResponse(res, {
                            status: 400,
                            data: { message: "No secret key provided" },
                        })];
                }
                return [4 /*yield*/, db_1.findLink(fileId)];
            case 1:
                file = _a.sent();
                if (!file) {
                    return [2 /*return*/, utils_1.sendResponse(res, {
                            status: 404,
                            data: { message: "File not found" },
                        })];
                }
                if (file.secretKey !== secretKey) {
                    return [2 /*return*/, utils_1.sendResponse(res, { status: 401, data: { message: "Unauthorized" } })];
                }
                return [4 /*yield*/, file.deleteOne()];
            case 2:
                _a.sent();
                return [2 /*return*/, utils_1.sendResponse(res, { status: 200, data: { message: "File deleted" } })];
        }
    });
}); };
exports.deleteFile = deleteFile;
var getFileInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fileId, file;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileId = req.params.id;
                return [4 /*yield*/, db_1.findLink(fileId)];
            case 1:
                file = _a.sent();
                if (!file) {
                    return [2 /*return*/, utils_1.sendResponse(res, {
                            status: 404,
                            data: { message: "File not found" },
                        })];
                }
                return [2 /*return*/, utils_1.sendResponse(res, {
                        status: 200,
                        data: {
                            id: file.id,
                            fileName: file.fileName,
                            size: file.size,
                            downloads: file.downloads,
                        },
                    })];
        }
    });
}); };
exports.getFileInfo = getFileInfo;
function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}
var getFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fileId, file, messageIds, sanitizedFilename, _loop_1, _i, messageIds_1, messageId, state_1, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileId = req.params.id;
                return [4 /*yield*/, db_1.findLink(fileId)];
            case 1:
                file = _a.sent();
                if (!file) {
                    return [2 /*return*/, utils_1.sendResponse(res, {
                            status: 404,
                            data: { message: "File not found" },
                        })];
                }
                messageIds = file.messageIds;
                sanitizedFilename = sanitizeFilename(file.fileName);
                res.setHeader("Content-Type", "application/octet-stream");
                res.setHeader("Content-Disposition", "attachment; filename=\"" + sanitizedFilename + "\"");
                res.setHeader("Content-Length", file.size);
                _loop_1 = function (messageId) {
                    var cdnLink, response_1, err_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 4, , 5]);
                                return [4 /*yield*/, BotManager_1.botManager.getAttachment(messageId)];
                            case 1:
                                cdnLink = _b.sent();
                                if (!cdnLink) {
                                    return [2 /*return*/, "continue"];
                                }
                                return [4 /*yield*/, axios_1.default.get(cdnLink, { responseType: "stream" })];
                            case 2:
                                response_1 = _b.sent();
                                return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        response_1.data.on("end", resolve);
                                        response_1.data.on("error", reject);
                                        response_1.data.pipe(res, { end: false });
                                    })];
                            case 3:
                                _b.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                err_2 = _b.sent();
                                console.error("Error streaming chunk " + messageId + ":", err_2);
                                return [2 /*return*/, { value: res.status(500).end() }];
                            case 5: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, messageIds_1 = messageIds;
                _a.label = 2;
            case 2:
                if (!(_i < messageIds_1.length)) return [3 /*break*/, 5];
                messageId = messageIds_1[_i];
                return [5 /*yield**/, _loop_1(messageId)];
            case 3:
                state_1 = _a.sent();
                if (typeof state_1 === "object")
                    return [2 /*return*/, state_1.value];
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, db_1.incrementDownloads(file)];
            case 6:
                _a.sent();
                res.end();
                return [3 /*break*/, 8];
            case 7:
                err_1 = _a.sent();
                console.error("Error incrementing downloads:", err_1);
                res.status(500).end();
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.getFile = getFile;