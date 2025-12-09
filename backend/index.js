// server.js
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import uploadRouter from "./routes/uploadPdf.js";
import signRouter from "./routes/signPdf.js";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

await connectDB();

app.use("/pdf", express.static(path.join(process.cwd(), "signed-pdfs")));
app.use("/api/upload", uploadRouter);
app.use("/api/sign", signRouter);

// Server start
app.listen(5000, () => console.log("Server running on port 5000"));
