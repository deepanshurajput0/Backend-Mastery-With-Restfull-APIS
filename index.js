import express from "express"
import dotenv from "dotenv"
import { ConnectDb } from "./db/db.js"
import userRouter from "./routes/userRoute.js"
import cookieParser from "cookie-parser"
const app = express()

dotenv.config()

ConnectDb() 
app.use(express.json())
app.use(cookieParser())
app.use('/api/v1/user',userRouter)

app.listen(process.env.PORT,()=>{
    console.log(`Server is listening on the Port`)
})