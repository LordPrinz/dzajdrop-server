import { type Request, type Response } from "express";
import { config } from "../config";

export const uploadController = (req: Request, res: Response) => {
	const { busboy } = req;

	const { uploadBytesLimit } = config;

	req.pipe(busboy);

	busboy.on(
		"file",
		(fieldname: any, file: any, filename: any, encoding: any, mimetype: any) => {
			file.on("data", (data: any) => {
				console.log(`File [${fieldname}] got ${data.length} bytes`);
			});
		}
	);

	res.status(200).json({ status: "success", message: "Upload controller" });
};
