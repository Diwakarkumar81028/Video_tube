import { apierror } from "../utils/apierror"
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

async function verifyJWT(req,res,next) {
   try {
    const token= req.cookies?.accessToken ||
     req.header("Authorization")?.replace("Bearer ","")
     //
     if(!token){
         throw new apierror(401,"Unauthorized request")
     }
 
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     //
   const user= await User.findById(decodedToken?._id).select(
         "-password -refreshToken"
     )
     if(!user){
         //TODO--> discuss about frontend
         throw new apierror(401,"Invalid Access Token")
     }
     //
     req.user=user;
     next();
   } catch (error) {
      throw new apierror(401,error?.message || "Invalid Access Token")
   }
}

export {verifyJWT}