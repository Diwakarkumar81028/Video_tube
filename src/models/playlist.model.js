import mongoose, { Schema } from "mongoose";

const playlistschema=new mongoose.Schema(
    {
       name:{
        type:String,
        req:true
       },
       description:{
        type:string,
        required:true
       },
       owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
       },
       videos:[
        {
        type:Schema.Types.ObjectId,
        ref:"Video"
       },
    ]

    },
    {
        timestamps:true
    }
)

export const Playlist=mongoose.model("Playlist",playlistschema);