"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importStar(require("express"));
var helmet_1 = __importDefault(require("helmet"));
var uploadRouter_1 = __importDefault(require("./routes/uploadRouter"));
var filesRouter_1 = __importDefault(require("./routes/filesRouter"));
var express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var cors_1 = __importDefault(require("cors"));
var app = express_1.default();
app.enable("trust proxy");
app.use(cors_1.default());
app.options("*", cors_1.default());
app.use(helmet_1.default());
var limiter = express_rate_limit_1.default({
    max: 100,
    windowMs: 1000 * 60,
    message: "Too many requests from this IP, please try again in a minute.",
});
app.use("/api", limiter);
app.use(express_mongo_sanitize_1.default());
app.use(express_1.json());
app.route("/").get(function (_req, res) {
    return res.send("Bonżur");
});
app.use("/api/v1/upload", uploadRouter_1.default);
app.use("/api/v1/files", filesRouter_1.default);
app.use("*", function (req, res) {
    res.status(404).json({
        status: "fail",
        message: "Can't find " + req.originalUrl + " on this server!",
    });
});
exports.default = app;
