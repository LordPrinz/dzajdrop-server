import { type Request, type Response } from "express";

export const uploadController = (req: Request, res: Response) => {
	const { busboy } = req;

	req.pipe(busboy);

	busboy.on(
		"file",
		(fieldname: any, file: any, filename: any, encoding: any, mimetype: any) => {
			const fileExtension = filename.split(".").at(-1);
			const fileName = filename.split(".").slice(0, -1).join(".");

			const bytesLimit = 25 * 1024 * 1024;
			let totalBytesReceived = 0;

			file.on("data", (data: any) => {
				console.log(`File [${fieldname}] got ${data.length} bytes`);
			});
		}
	);

	res.status(200).json({ status: "success", message: "Upload controller" });
};
