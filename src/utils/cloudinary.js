import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
//cloudinary started--> node js(doc)
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_SECRECT_KEY
});
//
async function cloudinary_upload(loacalFilePath) {
    try{
        if(!loacalFilePath){
            console.log("cludinary content upload error localfile path not found")
            return null;
        }
        const result=await cloudinary.uploader.upload(loacalFilePath,{
            resourse_type:"auto"
        });
        //   console.log("content is uploaded on cloudinary successfully");
        //   console.log(result.url);
          fs.unlinkSync(loacalFilePath);
          return result;
    }
    catch(err){
        fs.unlinkSync(loacalFilePath)// remove file from the local server
        console.log("cloudinary  upload error",err);
        throw err;
    }
}

export {cloudinary_upload}


//2.
// async function cloudinary_delete(public_id) {
//     try{
//          if(!public_id){
//             throw new apierror(400,"The public id of file that has to be deleted is not found");
//          }
//          //
//          const result=await cloudinary.uploader.destroy(public_id);
//          console.log(result);
//          return result;
//         }
//         catch(error){
//             console.log("cloudinary delete error",error);
//             throw new apierror(500,"failed to delete file from cloudinary");
//         }
// }

// export {cloudinary_delete}