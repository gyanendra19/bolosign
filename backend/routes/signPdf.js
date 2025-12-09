import express from "express";
import mongoose from "mongoose";
import { bucket } from "../db.js";
import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

const router = express.Router();

export const getPdfBytesFromGridFS = (pdfId) => {
  return new Promise((resolve, reject) => {
    const _id = new mongoose.Types.ObjectId(pdfId);

    const chunks = [];
    const downloadStream = bucket.openDownloadStream(_id);

    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("error", (err) => reject(err));
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

// Save signed PDF back to GridFS
export const savePdfToGridFS = (bytes) => {
  return new Promise((resolve, reject) => {
    const filename = `signed-${Date.now()}.pdf`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: "application/pdf",
    });

    uploadStream.end(bytes);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id.toString()); // signedPdfId
    });
    uploadStream.on("error", (err) => reject(err));
  });
};

router.route("/sign-pdf").post(async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body undefined" });
    }

    const { pdfId, signatureImage, box } = req.body;

    if (!pdfId || !signatureImage || !box) {
      return res
        .status(400)
        .json({ error: "pdfId, signatureImage and box are required" });
    }

    // Fetch original PDF bytes from GridFS
    const originalPdfBytes = await getPdfBytesFromGridFS(pdfId);

    // Hash BEFORE signing
    const beforeHash = crypto
      .createHash("sha256")
      .update(originalPdfBytes)
      .digest("hex");

    // 3. Load PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const pages = pdfDoc.getPages();

    const pageIndex = (box.page || 1) - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) {
      return res.status(400).json({ error: "Invalid page number" });
    }

    const page = pages[pageIndex];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const base64 = signatureImage.includes(",")
      ? signatureImage.split(",")[1]
      : signatureImage;

    const sigBytes = Buffer.from(base64, "base64");

    const sigImage = await pdfDoc.embedPng(sigBytes);
    const imgWidth = sigImage.width;
    const imgHeight = sigImage.height;

    // Convert percentage box to PDF coordinates (points)
    const boxWidth = box.widthPercent * pageWidth;
    const boxHeight = box.heightPercent * pageHeight;

    const boxX = box.xPercent * pageWidth;
    const boxYTop = box.yPercent * pageHeight;

    // Browser coord: (0,0) is top-left
    // PDF coord: (0,0) is bottom-left
    const boxY = pageHeight - boxYTop - boxHeight;

    // Aspect Ratio Constraint
    const scale = Math.min(boxWidth / imgWidth, boxHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    // Center the image inside the box
    const drawX = boxX + (boxWidth - drawWidth) / 2;
    const drawY = boxY + (boxHeight - drawHeight) / 2;

    // Draw the signature image on the PDF
    page.drawImage(sigImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });

    // Save signed PDF
    const signedPdfBytes = await pdfDoc.save();

    // Hash AFTER signing
    const afterHash = crypto
      .createHash("sha256")
      .update(signedPdfBytes)
      .digest("hex");

    const signedPdfId = await savePdfToGridFS(signedPdfBytes);
    const filename = `${signedPdfId}.pdf`;
    const filePath = path.join(process.cwd(), "signed-pdfs", filename);

    fs.writeFileSync(filePath, signedPdfBytes);

    await mongoose.connection.db.collection("pdfAudit").insertOne({
      originalPdfId: new mongoose.Types.ObjectId(pdfId),
      signedPdfId: new mongoose.Types.ObjectId(signedPdfId),
      beforeHash,
      afterHash,
      action: "SIGN",
      createdAt: new Date(),
    });

    res.json({
      success: true,
      signedPdfId,
      beforeHash,
      url: `/pdf/${signedPdfId}.pdf`,
      afterHash,
    });
  } catch (err) {
    console.error("Error in /sign-pdf:", err);
    res.status(500).json({ error: "Failed to sign PDF" });
  }
});

export default router;
