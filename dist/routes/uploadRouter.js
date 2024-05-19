"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var uploadController_1 = require("../controllers/uploadController");
var connect_busboy_1 = __importDefault(require("connect-busboy"));
var router = express_1.Router();
router.route("/").post(connect_busboy_1.default(), uploadController_1.uploadController);
exports.default = router;
