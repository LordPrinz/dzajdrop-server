import { type Request, type Response } from "express";
import multer from "multer";

const upload = multer({ dest: "temp-uploads/" });

export const uploadFile = upload.single("file");

export const uploadController = (req: Request, res: Response) => {
	res.status(200).json({ status: "success", message: "Upload controller" });
};
