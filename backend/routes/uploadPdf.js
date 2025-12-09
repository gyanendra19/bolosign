import express from "express";
import multer from "multer";
import crypto from "crypto";
import mongoose from "mongoose";
import { bucket } from "../db.js";

const router = express.Router();

// Multer: temporary file in memory
const upload = multer({ storage: multer.memoryStorage() });

router.route("/upload-pdf").post(upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfBuffer = req.file.buffer;

    // Compute SHA-256 hash before signing (audit trail)
    const beforeHash = crypto
      .createHash("sha256")
      .update(pdfBuffer)
      .digest("hex");

    // Upload PDF to GridFS
    const filename = `pdf-${Date.now()}.pdf`;

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: "application/pdf",
    });

    uploadStream.end(pdfBuffer);

    uploadStream.on("error", () => {
      console.log("Error while uploading:", error);
    });

    uploadStream.on("finish", async () => {
      // Save metadata to database
      await mongoose.connection.db.collection("pdfFiles").insertOne({
        fileId: uploadStream.id,
        name: filename,
        beforeHash,
        uploadedAt: new Date(),
      });

      res.json({
        success: true,
        pdfId: uploadStream.id.toString(),
        message: "PDF uploaded successfully",
      });
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error while uploading PDF" });
  }
});

export default router;
