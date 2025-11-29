import express from "express"
import  {dbConnect}  from "./config/db.js"
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import cors from "cors";
dotenv.config();
const app = express()

const PORT = process.env.PORT || 3000
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api",authRoutes)

dbConnect()

app.get("/", (req, res) => {
  res.send("Hello, World!")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})