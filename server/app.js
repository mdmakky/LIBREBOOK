import cookieParser from "cookie-parser"
import {config} from "dotenv"
import express from "express"
import cors from "cors"
import multer from "multer";
import { connectDB } from "./src/database/db.js"
import { errorMiddleWare } from "./src/middlewares/errorMiddleWares.js"
import authRouter from "./src/routes/authRouter.js" 
import bookRouter from "./src/routes/bookRouter.js"
config({
    path:"./config/config.env"
})

const app = express()
const upload = multer();

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods:["GET","PUT", "POST","DELETE"],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(upload.none());
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/book", bookRouter)

connectDB()


app.use(errorMiddleWare) 
export {app} 