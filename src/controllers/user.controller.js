import { apierror } from "../utils/apierror.js";
import {User} from "../models/user.model.js";
import {cloudinary_upload} from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";

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
    //4.if user exxits or not
    //5.validate password
    //6. generate access token and refresh token
    //6. loged in
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