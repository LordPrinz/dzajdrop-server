import FileModel from "../models/fileModel";
import { generateLink } from "./generate";

export const findLink = async (id: string) => {
	if (!id) {
		return null;
	}

	const res = await FileModel.findById(id);

	return res;
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
