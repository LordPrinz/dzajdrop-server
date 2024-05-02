import { Request, Response } from "express";
import fs from "fs";
import axios from "axios";

import { findLink } from "../utils";
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
	});
};

function sanitizeFilename(filename: string) {
	return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_"); // Replace any invalid characters with underscores
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

	const streamingPromises: Promise<unknown>[] = [];

	for (const messageId of messageIds) {
		const cdnLink = await botManager.getAttachment(messageId);

		if (!cdnLink) {
			continue;
		}

		const response = await axios.get(cdnLink, { responseType: "stream" });

		const streamPromise = new Promise((resolve, reject) => {
			response.data.on("end", resolve);
			response.data.on("error", reject);
		});

		response.data.pipe(res, { end: false });

		streamingPromises.push(streamPromise);
	}

	Promise.all(streamingPromises)
		.then(() => {
			res.end();
		})
		.catch((err) => {
			console.error("Error streaming data:", err);
			res.status(500).end();
		});
};
