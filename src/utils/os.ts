import { exec } from "child_process";
import os from "os";

const drive = os.platform() === "win32" ? "D:" : "/";

export const getFreeSpace = (): Promise<number> => {
	return new Promise((resolve, reject) => {
		let command: string = "";
		if (os.platform() === "win32") {
			command = `wmic logicaldisk where DeviceID="${drive}" get FreeSpace /value`;
		} else {
			command = `df -k ${drive}`;
		}
		exec(command, (error, stdout) => {
			if (error) {
				reject(error);
				return;
			}
			let freeSpace: number;
			if (os.platform() === "win32") {
				const lines = stdout.trim().split("\n");
				const freeSpaceLine = lines[lines.length - 1];
				const parts = freeSpaceLine.split("=");
				freeSpace = parseInt(parts[1].trim());
			} else {
				const lines = stdout.trim().split("\n");
				const lastLine = lines[lines.length - 1];
				const parts = lastLine.split(/\s+/);
				freeSpace = parseInt(parts[3]) * 1024;
			}
			if (!isNaN(freeSpace)) {
				resolve(freeSpace);
			} else {
				reject("Unable to parse free space value");
			}
		});
	});
};
