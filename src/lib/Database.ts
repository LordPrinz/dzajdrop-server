import FileModel from "../models/fileModel";
import { type FileInfo } from "../types/uploadFile";
import { generateUniqueID } from "../utils/db";

class Database {
	public async saveFile({
		fileName,
		size,
		messageIds,
	}: FileInfo & { messageIds: string[] }) {
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
	}
}

export const database = new Database();
