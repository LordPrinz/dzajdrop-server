import { nanoid } from "nanoid";

export const generateRandom = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateLink = () => {
	return nanoid(generateRandom(3, 10));
};
