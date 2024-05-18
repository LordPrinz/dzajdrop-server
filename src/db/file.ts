import FileModel from "../models/fileModel";
import { type FileInfo } from "../types";
import { generateUniqueID } from "../utils/db";

export type SaveFileParams = Omit<FileInfo, "extension"> & {
	messageIds: string[];
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
