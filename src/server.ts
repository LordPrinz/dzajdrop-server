import app from "./app";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! Shutting down...");
	console.log(err.name, err.message);
	process.exit(1);
});

const DB = process.env.DATABASE?.replace(
	"<PASSWORD>",
	process.env.DATABASE_PASSWORD || ""
);

if (!DB) {
	console.log("No database link!");
	process.exit(1);
}

mongoose
	.connect(DB)
	.then(() => {
		console.log("DB connection successful!");
	})
	.catch((err) => console.log(err));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.log(`App runnning on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! Shutting down...");
	console.log((err as any).name, (err as any).message);
	server.close(() => {
		process.exit(1);
	});
});

process.on("SIGTERM", () => {
	console.log("SIGTERM RECEIVED. Shutting down gracefully");
	server.close(() => {
		console.log("Process terminated!");
	});
});
