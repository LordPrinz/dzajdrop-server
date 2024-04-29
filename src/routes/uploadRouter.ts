import { Router } from "express";
import { uploadController } from "../controllers/uploadController";
import busboy from "connect-busboy";

const router = Router();

router.route("/").post(busboy(), uploadController);

export default router;
