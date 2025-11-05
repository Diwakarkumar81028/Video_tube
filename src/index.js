// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})
connectDB();









// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app=express()

// function connectDB(){

// }

// (async ()=>{
//    try{
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//       //on---> error throw
//       app.on("error",(err)=>{
//         console.log("error:","server is not listening")
//         throw err
//       })

//       app.listen(process.env.PORT,()=>{
//          console.log("app is listening at",process.env.PORT);
//       })
//    }
//    catch(error){
//       console.log("db connection error",error);
//       throw error;
//    }
// })()