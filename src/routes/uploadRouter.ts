import { Router } from "express";
import { uploadController, uploadFile } from "../controllers/uploadController";

const router = Router();

router.route("/").post(uploadFile, uploadController);

export default router;
