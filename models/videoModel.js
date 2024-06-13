import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    descriptiopn:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})


export const videModel = mongoose.model('Video',videoSchema)