import express, { json } from "express";
import helmet from "helmet";

import uploadRouter from "./routes/uploadRouter";
import filesRouter from "./routes/filesRouter";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();

app.enable("trust proxy");

app.use(cors());
app.options("*", cors());

app.use(helmet());

const limiter = rateLimit({
	max: 100,
	windowMs: 1000 * 60,
	message: "Too many requests from this IP, please try again in a minute.",
});

app.use("/api", limiter);

app.use(mongoSanitize());

app.use(json());

app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/files", filesRouter);

app.use("*", (req, res) => {
	res.status(404).json({
		status: "fail",
		message: `Can't find ${req.originalUrl} on this server!`,
	});
});

export default app;
