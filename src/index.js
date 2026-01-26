// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path:'./env'
})
///////////////////////
connectDB()
.then(()=>{
    const port=process.env.PORT || 4000
    app.listen(port, () => {
    console.log(`server is  listening on port ${port}`)
})
})
.catch((err)=>{
   console.log("server starting error");
})









