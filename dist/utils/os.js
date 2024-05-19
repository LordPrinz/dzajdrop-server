"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTempDirectory = exports.calculateFileSize = exports.getFreeSpace = void 0;
var child_process_1 = require("child_process");
var os_1 = __importDefault(require("os"));
var fs_1 = __importDefault(require("fs"));
var drive = os_1.default.platform() === "win32" ? "D:" : "/";
var getFreeSpace = function () {
    return new Promise(function (resolve, reject) {
        var command = "";
        if (os_1.default.platform() === "win32") {
            command = "wmic logicaldisk where DeviceID=\"" + drive + "\" get FreeSpace /value";
        }
        else {
            command = "df -k " + drive;
        }
        child_process_1.exec(command, function (error, stdout) {
            if (error) {
                reject(error);
                return;
            }
            var freeSpace;
            if (os_1.default.platform() === "win32") {
                var lines = stdout.trim().split("\n");
                var freeSpaceLine = lines[lines.length - 1];
                var parts = freeSpaceLine.split("=");
                freeSpace = parseInt(parts[1].trim());
            }
            else {
                var lines = stdout.trim().split("\n");
                var lastLine = lines[lines.length - 1];
                var parts = lastLine.split(/\s+/);
                freeSpace = parseInt(parts[3]) * 1024;
                console.error(freeSpace);
            }
            if (!isNaN(freeSpace)) {
                resolve(freeSpace);
            }
            else {
                reject("Unable to parse free space value");
            }
        });
    });
};
exports.getFreeSpace = getFreeSpace;
var calculateFileSize = function (path) {
    var stats = fs_1.default.statSync(path);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
};
exports.calculateFileSize = calculateFileSize;
var createTempDirectory = function () {
    var tempId = crypto.randomUUID();
    var tempFolderPath = "./temp/" + tempId;
    fs_1.default.mkdirSync(tempFolderPath, { recursive: true });
    return tempFolderPath;
};
exports.createTempDirectory = createTempDirectory;
