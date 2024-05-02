"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = __importDefault(require("./app"));
var mongoose_1 = __importDefault(require("mongoose"));
process.on("uncaughtException", function (err) {
    console.log("UNCAUGHT EXCEPTION! Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});
//? Configuration of dotenv is in config.ts file
var DB = (_a = process.env.DATABASE) === null || _a === void 0 ? void 0 : _a.replace("<PASSWORD>", process.env.DATABASE_PASSWORD || "");
if (!DB) {
    console.log("No database link!");
    process.exit(1);
}
mongoose_1.default
    .connect(DB)
    .then(function () {
    console.log("DB connection successful!");
})
    .catch(function (err) { return console.log(err); });
var port = process.env.PORT || 3000;
var server = app_1.default.listen(port, function () {
    console.log("App runnning on port " + port + "...");
});
process.on("unhandledRejection", function (err) {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.log(err.name, err.message);
    server.close(function () {
        process.exit(1);
    });
});
process.on("SIGTERM", function () {
    console.log("SIGTERM RECEIVED. Shutting down gracefully");
    server.close(function () {
        console.log("Process terminated!");
    });
});
