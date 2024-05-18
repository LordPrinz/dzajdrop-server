import { Response } from "express";

export const sendResponse = (
	res: Response,
	{
		status = 200,
		data = {},
	}: {
		status?: number;
		data?: any;
	}
) => {
	return res.status(status).send(data);
};

export const streamResponse = (res: Response, data: Object) => {
	res.write(`data: ${JSON.stringify(data)}\n\n`);
};
