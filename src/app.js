import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
//cors issue 
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//json format data receving
app.use(express.json({limit:"20kb"}))
//data receving from url
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//img+pdf--> store in public folder
app.use(express.static("public"));
//cookies
app.use(cookieParser());


//user routes;
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users",userRouter)//--> user.routes.js me jayega
export default app;