import { Router } from "express";
import {
	deleteFile,
	getFile,
	getFileInfo,
} from "../controllers/fileController";

const router = Router();

router.route("/:id").get(getFile).delete(deleteFile);
router.route("/:id/info").get(getFileInfo);

export default router;
