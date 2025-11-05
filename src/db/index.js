
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 async function connectDB(){
     try{
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`\n mongodb connected !! DB Host ${connectionInstance.connection.host}`);
        //
     }
     catch(error){
        console.log("db connection error",error);
        throw error;
     }
}

export default connectDB