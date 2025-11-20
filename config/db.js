import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const dbConnect = async () => {
    const URI = process.env.MONGO_URI
    mongoose.connect(URI)
    .then(()=>console.log("Database connected successfully"))
    .catch((err)=>console.log("Database connection failed", err.message))
}