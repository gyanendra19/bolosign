import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import dotenv from "dotenv";
dotenv.configDotenv();

export let bucket;
const mongoUrl = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.PASSWORD
);

export const connectDB = async () => {
  const conn = await mongoose.connect(mongoUrl);

  bucket = new GridFSBucket(conn.connection.db, {
    bucketName: "pdfFiles",
  });

  console.log("MongoDB + GridFS connected");
};
