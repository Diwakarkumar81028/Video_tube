import express from "express"
import CookieParser from "cookieparser";
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
app.use(CookieParser());
export default app;