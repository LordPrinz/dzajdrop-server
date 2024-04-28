import express, { json } from "express";
import uploadRouter from "./routes/uploadRouter";
import filesRouter from "./routes/filesRouter";

const app = express();

app.use(json());

app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/files", filesRouter);

export default app;
