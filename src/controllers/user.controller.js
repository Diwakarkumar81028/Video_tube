import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import {cloudinary_upload} from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";


const registerUser=asyncHandler(async(req,res)=>{
    //get user detail -> frontend
    const {fullName,email,username,password}=req.body;
    // console.log("email",email);
    //
    // if(fullName===""){
    //     throw new apierror(400,"full name is required");
    // }
    //
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
       throw new apierror(400,"all fields are required");
    }
    //user allready exists
   const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new apierror(409,"User  allready exists")
    }
    //image
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path  

    if(!avatarLocalPath){
        throw new apierror(400,"avatar is required");
    }
    //
   const avatar= await cloudinary_upload(avatarLocalPath)
   const coverImage=await cloudinary_upload(coverImageLocalPath);
   if(!avatar){
    throw new apierror(400,"avatar file is required");
   }
   //new user creation
   const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })
  //user creation
   const createduser=await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createduser){
    throw new apierror(500,"user not registered");
   }
   //res
   return res.status(201).json(
    new apiresponse(200,createduser,"user registered Successfully")
   )
})

export {registerUser}