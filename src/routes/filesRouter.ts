import { Router } from "express";

const router = Router();

router.route("/:id").post(() => {
	console.log("XD");
});

export default router;
