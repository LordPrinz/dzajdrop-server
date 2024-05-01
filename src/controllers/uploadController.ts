import { type Request, type Response } from "express";
import { config } from "../config";
import fs from "fs";
import { botManager } from "../lib/BotManager";

const messageIds: string[] = [];

const createTempDirectory = () => {
	const tempId = crypto.randomUUID();
	const tempFolderPath = `./temp/${tempId}`;

	fs.mkdirSync(tempFolderPath, { recursive: true });

	return tempFolderPath;
};

const uploadToDiscordHandler = async (path: string, fileName: string) => {
	const discordRes = await botManager.sendAttachment(path, fileName);

	if (!discordRes?.id) {
		return;
	}

	messageIds.push(discordRes.id);

	fs.unlinkSync(path);
};

export const uploadController = (req: Request, res: Response) => {
	const { busboy } = req;

	const { uploadBytesLimit } = config;

	const originalFileSize = parseInt(req.headers["content-length"] || "0", 10);

	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	req.pipe(busboy);

	const tempFolderPath = createTempDirectory();

	let totalBytesReceived = 0;
	let fileStream: fs.WriteStream | null = null;
	let fileIndex = 0;

	const sendProgressResponse = (progress: number) => {
		res.write(`data: ${JSON.stringify({ progress })}\n\n`);
	};

	sendProgressResponse(0);

	busboy.on("file", (_, file, fileInfo) => {
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
			const progress = Math.floor(
				((fileIndex * uploadBytesLimit + totalBytesReceived) / originalFileSize) *
					100
			);
			console.log(progress);
			sendProgressResponse(progress);
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

			// Save to mongo database

			messageIds.length = 0;

			res.write(
				"data: " +
					JSON.stringify({
						status: "success",
						message: "Upload finished!",
						progress: 100,
					}) +
					"\n\n"
			);

			res.end();
		});
	});

	req.on("close", () => {
		totalBytesReceived = 0;
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

		// delete messages

		busboy.removeAllListeners(); // Remove all event listeners to prevent memory leaks
	});
	busboy.on("error", (err) => {
		res.write(
			"data: " +
				JSON.stringify({
					status: "fail",
					message: "Something went wrong!",
					progress: 0,
				}) +
				"\n\n"
		);

		res.end();
		console.error(err);
	});
};
