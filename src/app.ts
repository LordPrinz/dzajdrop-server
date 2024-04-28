import express, { json } from "express";
import uploadRouter from "./routes/uploadRouter";
import filesRouter from "./routes/filesRouter";

const app = express();

//TODO: add security

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
