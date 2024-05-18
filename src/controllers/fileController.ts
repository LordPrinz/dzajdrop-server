import { Request, Response } from "express";
import axios from "axios";

import { findLink, incrementDownloads } from "../utils";
import { botManager } from "../lib/BotManager";

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
		downloads: file.downloads,
	});
};

function sanitizeFilename(filename: string) {
	return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export const getFile = async (req: Request, res: Response) => {
	const fileId = req.params.id;

	const file = await findLink(fileId);

	if (!file) {
		return res.status(404).json({ message: "File not found" });
	}

	const messageIds = file.messageIds;

	const sanitizedFilename = sanitizeFilename(file.fileName);

	res.setHeader("Content-Type", "application/octet-stream");
	res.setHeader(
		"Content-Disposition",
		`attachment; filename="${sanitizedFilename}"`
	);
	res.setHeader("Content-Length", file.size);

	for (const messageId of messageIds) {
		try {
			const cdnLink = await botManager.getAttachment(messageId);

			if (!cdnLink) {
				continue;
			}

			const response = await axios.get(cdnLink, { responseType: "stream" });

			await new Promise((resolve, reject) => {
				response.data.on("end", resolve);
				response.data.on("error", reject);
				response.data.pipe(res, { end: false });
			});
		} catch (err) {
			console.error(`Error streaming chunk ${messageId}:`, err);
			return res.status(500).end();
		}
	}

	try {
		await incrementDownloads(file);
		res.end();
	} catch (err) {
		console.error("Error incrementing downloads:", err);
		res.status(500).end();
	}
};
