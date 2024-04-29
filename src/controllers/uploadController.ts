import { type Request, type Response } from "express";
import { config } from "../config";
import { botManager } from "../lib/BotManager";
import { type FileInfo } from "../lib/types/busboy";
import { Readable } from "stream";
import fs from "fs";
import crypto from "crypto";

export const uploadController = (req: Request, res: Response) => {
	const { busboy } = req;

	const { uploadBytesLimit } = config;

	req.pipe(busboy);

	const tempId = crypto.randomUUID();
	const tempFolderPath = `./temp/${tempId}`;

	fs.mkdirSync(tempFolderPath, { recursive: true });

	const messageIds: string[] = [];

	let totalBytesReceived = 0;
	let fileStream: fs.WriteStream | null = null;
	let files = 0;

	busboy.on("file", (_: string, file: Readable, fileInfo: FileInfo) => {
		const fileName = fileInfo.filename;
		totalBytesReceived = 0;

		fileStream = fs.createWriteStream(`./temp/${tempId}/chunk-${files}.dzaj`);

		file.on("data", (data: Buffer) => {
			totalBytesReceived += data.length;

			if (!fileStream) {
				return;
			}

			if (totalBytesReceived <= uploadBytesLimit) {
				fileStream.write(data);
			} else {
				const overflowBytes = totalBytesReceived - uploadBytesLimit;
				const actualDataBytes = data.slice(0, data.length - overflowBytes);

				fileStream.write(actualDataBytes);

				fileStream.end();

				botManager
					.sendSmallAttachment(`./temp/${tempId}/chunk-${files}.dzaj`, fileName)
					.then((data) => {
						if (!data?.id) return;
						messageIds.push(data.id);
						fs.unlinkSync(`./temp/${tempId}/chunk-${files - 1}.dzaj`);
					})
					.catch((err) => console.log(err));

				files++;

				fileStream = fs.createWriteStream(`./temp/${tempId}/chunk-${files}.dzaj`);

				fileStream.write(data.slice(data.length - overflowBytes));

				totalBytesReceived = data.length - overflowBytes;
			}
		});

		file.on("end", async () => {
			if (fileStream) {
				fileStream.end();
			}

			const response = await botManager
				.sendSmallAttachment(`./temp/${tempId}/chunk-${files}.dzaj`, fileName)
				.catch((err) => console.log(err));

			if (response?.id) {
				messageIds.push(response.id);
				fs.unlinkSync(`./temp/${tempId}/chunk-${files}.dzaj`);
				fs.rmdirSync(`./temp/${tempId}`);
			}

			//TODO: Save to database

			console.log("File upload complete");
		});

		file.on("error", (error: any) => {
			console.error("Error during file upload:", error);
			res.status(500).json({ error: "Error during file upload" });
		});
	});

	busboy.on("finish", () => {
		console.log("Busboy finished processing request");
		res.status(200).json({ status: "success", message: "Upload controller" });
	});
};
