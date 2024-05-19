"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamResponse = exports.sendResponse = void 0;
var sendResponse = function (res, _a) {
    var _b = _a.status, status = _b === void 0 ? 200 : _b, _c = _a.data, data = _c === void 0 ? {} : _c;
    return res.status(status).send(data);
};
exports.sendResponse = sendResponse;
var streamResponse = function (res, data) {
    res.write("data: " + JSON.stringify(data) + "\n\n");
};
exports.streamResponse = streamResponse;
