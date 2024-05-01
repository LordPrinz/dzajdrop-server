import { Router } from "express";
import { deleteFile, getFileInfo } from "../controllers/fileController";

const router = Router();

router
	.route("/:id")
	.get(() => {
		console.log("XD");
	})
	.delete(deleteFile);
router.route("/:id/info").get(getFileInfo);

export default router;
