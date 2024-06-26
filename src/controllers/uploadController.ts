import { type Request, type Response } from "express";
import { config } from "../config";
import fs from "fs";
import { botManager } from "../lib/BotManager";

import { database } from "../lib/Database";
import {
	calculateFileSize,
	createTempDirectory,
	getFreeSpace,
	sendResponse,
	streamResponse,
} from "../utils";

const setHeaders = (res: Response) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
};

export const uploadController = async (req: Request, res: Response) => {
	const { uploadBytesLimit } = config;

	const freeSpace = await getFreeSpace();

	if (freeSpace - uploadBytesLimit <= uploadBytesLimit) {
		return sendResponse(res, { status: 413, data: "Insufficient storage space" });
	}

	const { busboy } = req;

	if (!busboy) {
		return sendResponse(res, { status: 400, data: "No file provided" });
	}

	const avaliableBot = botManager.getAvailableBot(0);

	if (avaliableBot.slots < 0) {
		return sendResponse(res, {
			status: 503,
			data: "Failed to upload file due to high traffic. Please try again later.",
		});
	}

	const messageIds: string[] = [];
	let originalFileSize = 0;

	const uploadToDiscordHandler = async (path: string, fileName: string) => {
		const discordRes = await botManager.sendAttachment(path, fileName);

		if (!discordRes?.id) {
			return;
		}

		originalFileSize += calculateFileSize(path);
		messageIds.push(discordRes.id);

		fs.unlinkSync(path);
	};

	const approximateFileSize = parseInt(req.headers["content-length"] || "0", 10);

	setHeaders(res);

	req.pipe(busboy);

	const tempFolderPath = createTempDirectory();

	let totalBytesReceived = 0;
	let fileStream: fs.WriteStream | null = null;
	let fileIndex = 0;

	const calculateProgress = () => {
		const progress = Math.ceil(
			((fileIndex * uploadBytesLimit + totalBytesReceived) / approximateFileSize) *
				100
		);

		return progress;
	};

	const sendProgressResponse = () => {
		const progress = calculateProgress();
		streamResponse(res, { progress });
	};

	busboy.on("file", (_, file, fileInfo) => {
		sendProgressResponse();
		const fileName = fileInfo.filename;
		totalBytesReceived = 0;

		fileStream = fs.createWriteStream(
			`${tempFolderPath}/chunk-${fileIndex}.dzaj`
		);

		file.on("data", async (data) => {
			totalBytesReceived += data.length;

			if (!fileStream) {
				return;
			}

			if (totalBytesReceived <= uploadBytesLimit) {
				return fileStream.write(data);
			}

			file.pause();

			const overflowBytes = totalBytesReceived - uploadBytesLimit;
			const actualDataBytes = data.slice(0, data.length - overflowBytes);

			fileStream.write(actualDataBytes);
			fileStream.end();

			await uploadToDiscordHandler(
				`${tempFolderPath}/chunk-${fileIndex}.dzaj`,
				fileName
			);

			fileIndex++;
			fileStream = fs.createWriteStream(
				`${tempFolderPath}/chunk-${fileIndex}.dzaj`
			);
			fileStream.write(data.slice(data.length - overflowBytes));
			totalBytesReceived = data.length - overflowBytes;

			file.resume();

			sendProgressResponse();
		});

		file.on("end", async () => {
			if (fileStream) {
				fileStream.end();
			}

			await uploadToDiscordHandler(
				`${tempFolderPath}/chunk-${fileIndex}.dzaj`,
				fileName
			);

			fs.rmSync(tempFolderPath, { recursive: true });

			const response = await database.saveFile({
				fileName,
				size: originalFileSize,
				messageIds,
			});

			totalBytesReceived = 0;
			messageIds.length = 0;
			originalFileSize = 0;

			if (!response) {
				streamResponse(res, {
					status: "fail",
					message: "Something went wrong!",
					progress: 0,
				});

				return res.end();
			}

			streamResponse(res, {
				status: "success",
				message: "Upload finished!",
				fileId: response.id,
				secretKey: response.secretKey,
				progress: 100,
			});

			res.end();
		});
	});

	req.on("close", async () => {
		const progress = calculateProgress();

		if (progress === 100) {
			return;
		}

		if (fileStream) {
			fileStream.close();

			const filePath = fileStream.path;

			fileStream.destroy();

			fs.unlink(filePath, () => {
				fs.rmSync(tempFolderPath, { recursive: true });
			});
		} else {
			if (fs.existsSync(tempFolderPath)) {
				fs.rmSync(tempFolderPath, { recursive: true });
			}
		}

		for (const messageId of messageIds) {
			try {
				await botManager.deleteMessage(messageId);
			} catch (error) {
				console.error(`Error deleting message ${messageId}:`, error);
			}
		}

		totalBytesReceived = 0;
		messageIds.length = 0;
		originalFileSize = 0;

		busboy.removeAllListeners();
	});
	busboy.on("error", (err) => {
		streamResponse(res, {
			status: "fail",
			message: "Something went wrong!",
			progress: 0,
		});

		res.end();
		console.error(err);
	});
};
