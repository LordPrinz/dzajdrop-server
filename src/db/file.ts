import { type Document } from "mongoose";
import FileModel, { type FileData } from "../models/fileModel";
import { type FileInfo } from "../types";
import { generateLink } from "../utils";

export type SaveFileParams = Omit<FileInfo, "extension"> & {
	messageIds: string[];
};

export const generateUniqueID = async () => {
	let id: string;

	do {
		id = generateLink();
		const existingLink = await findLink(id);

		if (existingLink) {
			continue;
		}

		return id;
	} while (true);
};

export const incrementDownloads = async (document: FileData) => {
	await document.incrementDownloads();
};

export const saveFile = async ({
	fileName,
	size,
	messageIds,
}: SaveFileParams) => {
	const uniqueId = await generateUniqueID();
	const secretKey = crypto.randomUUID();

	const objectToSave = {
		_id: uniqueId,
		fileName,
		secretKey,
		size,
		messageIds,
	};

	const res = await FileModel.create(objectToSave);

	return res;
};

export const findLink = async (id: string) => {
	if (!id) {
		return null;
	}

	const res = await FileModel.findById(id);

	return res as (FileData & Document) | null;
};
