import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
 cloud_name:'newcanta' ,
 api_key:'462237924872398' ,
 api_secret:'Pea94FjERYPvPsbzQLyKg0xzS28'
})


export const uploadOnCloudinary =async(localFilePath)=>{
  try {
    if(!localFilePath) return null
    const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:'auto'
    })
    // console.log('File is uploaded in cloudinary', response.url)
    // fs.unlinkSync(localFilePath) 
    return response.url
    
  } catch (error) {
    console.log(error)
    fs.unlinkSync(localFilePath) 
  }
}




