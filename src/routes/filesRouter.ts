import { Router } from "express";

const router = Router();

router.route("/:id").get(() => {
	console.log("XD");
});
router.route("/:id/info").get(() => {
	console.log("XD");
});

export default router;
