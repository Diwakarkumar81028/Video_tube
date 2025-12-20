import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
//cloudinary started--> node js(doc)
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:CLOUDINARY_SECRECT_KEY
});
//
async function cloudinary_upload(loacalFilePath) {
    try{
        if(!loacalFilePath){
            console.log("cludinary content upload error localfile path not found")
            return null;
        }
        const result=await cloudinary.v2.uploader.upload(loacalFilePath,{
            resourse_type:"auto"
        });
          console.log("content is uploaded on cloudinary successfully");
          console.log(result.url);
          return result;
    }
    catch(err){
        fs.unlinkSync(loacalFilePath)// remove file from the local server
        console.log("cloudinary  upload error",err);
        throw err;
    }
}

export {cloudinary_upload}