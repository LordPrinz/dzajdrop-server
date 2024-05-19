"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLink = exports.generateRandom = void 0;
var generateRandom = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.generateRandom = generateRandom;
var characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-";
var charactersLength = characters.length;
var generateLink = function () {
    var result = "";
    for (var i = 0; i < exports.generateRandom(3, 8); i++) {
        var randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
};
exports.generateLink = generateLink;
