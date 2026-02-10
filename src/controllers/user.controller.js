import { apierror } from "../utils/apierror.js";
import {User} from "../models/user.model.js";
import {cloudinary_upload} from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import { use } from "react";

async function generateAccessAndRefreshToken(userId) {
    try{
       const user=await User.findById(userId); 
       const accessToken=user.generateAccessToken();
       const refreshToken=user.generateRefreshToken();
       //add refresh token to user and save it
       user.refreshToken=refreshToken;
       await user.save({validateBeforeSave:false});
       //
       return{accessToken,refreshToken}
    }
    catch(err){
        throw new apierror(500,"Something went wrong while generating refresh and access token");
    }
}

//1.Register user
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
    if(!(validator.isEmail(email))){
        throw new apierror(400,"Invalid email");
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

//2.login user
async function loginUser(req,res) {
    //1.get username,passsword,email --> for login
    //2. info should not be empty
    //3. find user in db with that email or username
    //4.if user exits or not
    //5.validate password
    //6. generate access token and refresh token
    //6. logged in
    //7. send in cookies

    //1.
     const {username,email,password}=req.body;
     //2.
     if(!username && !email){
         throw new apierror(400,"username or email is required");
     }
     if(!password){
         throw new apierror(400,"Password is required")
     }
     //3.
   const user=await User.findOne({
         $or:[{email},{username}]
     })
     if(!user){
         throw new apierror(404,"User is not registered")
     }
     //4.
     const isPassordValid=await user.isPasswordCorrect(password);
     if(!isPassordValid){
         throw new apierror(401,"Password is Incorrect");
     }
     //5.
     const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
     //6.
     const loggedInUser=await User.findById(user._id).select(
     "-password -refreshToken"
    )
   //7.cookies
    //by default any one can modify the cookies on frontend;
    const options={
     httpOnly:true,// modifiable only by server not by frontend
     secure:true//-->
    }
    //res
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
     new apiresponse(
         200,
         {
            user:loggedInUser,accessToken,refreshToken 
         },
         "User logged In Successfully"
   )
   )
}
export {loginUser}

//3. logout
async function logoutUser(req, res) {
  const userid = req.user._id;
//   console.log(req);
  await User.findByIdAndUpdate(
    userid,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  //
  //cookies
   //by default any one can modify the cookies on frontend;
   const options={
    httpOnly:true,// modifiable only by server not by frontend
    secure:true//-->
   }

   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new apiresponse(200,{},"User logged Out"))
}
export {logoutUser}

//4.generate new access and refresh token---> not need to login frequently
const refreshAccessToken=async function(req,res) {
try {
        //1. get refrresh token
        const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
       if(!incomingRefreshToken){
        throw new apierror(401,"unauthorized request")
       }
       //2. verify refresh token;
      const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
       //3. user 
       const user=await User.findById(decodedToken?._id);
       if(!user) {
        throw new apierror(400,"Invalid refreshToken")
       }
       //4.match refrsh token
       if(incomingRefreshToken!==user?.refreshToken){
        throw new apierror(401,"Refresh Token is expired")
       }
       //5.gen access token
       const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id);
       //
       const options={
        httpOnly:true,
        secure:true
       }
    
       return res.status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",newrefreshToken.options)
       .json(
          new apiresponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "Access token refreshed"
          )
       )
} 
catch (error) {
    throw new apierror(401,error?.message||"invalid refreshtoken")
}
}
export{refreshAccessToken}

//5.change password
async function changeUserPassword(req,res) {
    //1. auth 
    //2.old password ko validate
    const {oldPassword,newPassword}=req.body
    const user=User.findById(req.user._id);
    const isvaid=await user.isPasswordCorrec(oldPassword)
    //
    if(!isvaid){
        throw new apierror(400,"Incorrect old password");
    }
    //3. change password and save
    user.password=newPassword;
   await user.save({validateBeforeSave:false})
   //4.res
   return res.status(200)
   .json(
    new apiresponse(
        200,
        {},
        "password changed successfully"
    )
   )
}
export {changeUserPassword}

//6.get current user
async function getCurrentUser(req,res) {
    return res.status(200)
    .json(200,req.user,"Current User fetched successfully")
}
export {getCurrentUser}

//7.optional--> update account
async function updateAccountDetails(req,res) {
    const {fullName,email}=req.body

    if(!fullName && !email){
        throw new apierror(400,"All fields are required")
    }
    //
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")
    //res
    return res.status(200)
    .json(
        new apiresponse(200,{user},"Account details updated successfully")
    )
}
export {updateAccountDetails}

//8. avatar update
async function updateUserAvatar(req,res) {
   const avatarlocalpath= req.file?.path
   if(!avatarlocalpath){
    new apierror(400,"Avatar update file is missing")
   }
   //upload on cloudunary
   const avatar=await cloudinary_upload(avatarlocalpath)
   if(!avatar){
    throw new apierror(400,"Error while updating the avatar")
   }
   //update
   const user=await User.findByIdAndUpdate(
     req.user?._id,
     {
        $set:{
            avatar:avatar.url
        }
     },
     {
        new:true
     }
   ).select("-password -refreshToken")
   //res
   return res.status(200)
   .json(
    new apiresponse(200,user,"Avatar is Updated Successfully")
   )
}
export {updateUserAvatar}

//9 update cover image
async function updateUserCoverImage(req,res) {
    //1.multer,2.auth
   const coverImagelocalpath= req.file?.path
   if(!coverImagelocalpath){
    new apierror(400,"coverImage update file is missing")
   }
   //upload on cloudunary
   const coverImage=await cloudinary_upload(coverImagelocalpath)
   if(!avatar){
    throw new apierror(400,"Error while updating the coverImage")
   }
   //update
   const user=await User.findByIdAndUpdate(
     req.user?._id,
     {
        $set:{
            coverImage:coverImage.url
        }
     },
     {
        new:true
     }
   ).select("-password -refreshToken")
   //ret
    return res.status(200)
   .json(
    new apiresponse(200,user,"CoverImage is Updated Successfully")
   )
}

export {updateUserCoverImage}