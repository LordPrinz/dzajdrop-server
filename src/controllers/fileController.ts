import { Request, Response } from "express";
import { findLink } from "../utils";

export const deleteFile = async (req: Request, res: Response) => {
	const fileId = req.params.id;

	const secretKey = req.body.secretKey;

	if (!secretKey) {
		return res.status(400).send({ message: "No secret key provided" });
	}

	const file = await findLink(fileId);

	if (!file) {
		return res.status(404).send({ message: "File not found" });
	}

	if (file.secretKey !== secretKey) {
		return res.status(401).send({ message: "Unauthorized" });
	}

	await file.deleteOne();

	return res.status(200).json({ message: "File deleted" });
};

export const getFileInfo = async (req: Request, res: Response) => {
	const fileId = req.params.id;

	const file = await findLink(fileId);

	if (!file) {
		return res.status(404).json({ message: "File not found" });
	}

	return res.status(200).json({
		id: file.id,
		fileName: file.fileName,
		size: file.size,
	});
};
