"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var fileController_1 = require("../controllers/fileController");
var router = express_1.Router();
router.route("/:id").get(fileController_1.getFile).delete(fileController_1.deleteFile);
router.route("/:id/info").get(fileController_1.getFileInfo);
exports.default = router;
