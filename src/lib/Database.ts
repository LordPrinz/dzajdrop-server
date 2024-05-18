import { SaveFileParams, saveFile } from "../db";

class Database {
	public async saveFile(params: SaveFileParams) {
		return await saveFile(params);
	}
}

export const database = new Database();
