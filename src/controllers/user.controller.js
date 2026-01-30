import { apierror } from "../utils/apierror.js";
import {User} from "../models/user.model.js";
import {cloudinary_upload} from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";

//Register user
async function  registerUser(req,res) {
    //1. take data from user--> username,email,fullname...  from user .model.js
    //2. validation -> not  empty
    //3. check user allready exits-->using email
    //4. avatar is required,check for coverimage--> file 
    //5. upload them to cloudinary
    //6. create user object-->create entry in db;
    //7.remove password and refrsh token field from response
    //8.check user created or not
    //9. return respone
    //1.
    const {fullName,email,username,password}=req.body;
    //2.
    if(fullName=="" || email=="" || username=="" || password==""){
        console.log("Register info is less");
        throw new apierror(400,"All field is required");
    }
    //3.
    const exiteduser=await User.findOne({
        $or:[{username},{email}]
    })
    if(exiteduser){
        throw new apierror(409,"User is allready registered")
    }
    //4.multer(midddleware)-->add-->req.files
    const avatarlocalpath= req.files?.avatar[0]?.path;
    const coverImagelocalpath=req.files?.coverImage[0]?.path;
    if(!avatarlocalpath){
        throw new apierror(400,"Avatar file is required")
    }
    //5.
   const avatar= await cloudinary_upload(avatarlocalpath);
   const coverImage= await cloudinary_upload(coverImagelocalpath);
   //6.
   if(!avatar){
    throw new apierror(400,"Avatar file is required")
   }
   //7.
   const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username
   })
   //8.
   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new apierror(500,"Something went wrong while registring a user")
   }
   //9.
   return res.status(201).json(
    new apiresponse(200,createdUser,"User registred Successfully")
   )
}
export {registerUser}
//login user