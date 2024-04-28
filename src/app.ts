import express, { json } from "express";
import uploadRouter from "./routes/uploadRouter";

const app = express();

app.use(json());

app.use("/api/v1/upload", uploadRouter);

export default app;
