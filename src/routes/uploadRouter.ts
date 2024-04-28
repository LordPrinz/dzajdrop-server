import { Router } from "express";

const router = Router();

router.route("/").post(() => {
	console.log("XD");
});

export default router;
