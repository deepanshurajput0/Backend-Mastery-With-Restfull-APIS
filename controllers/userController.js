import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { userModel } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResposne.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await userModel.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {refreshToken, accessToken}

    } catch (error) {
        console.log(error)
        throw new apiError(500,'Something went wrong while generating refresh and access token')
    }
}

export const registerUser = asyncHandler(async(req,res)=>{
    const { username, fullname, email, password } = req.body;
    if(!username || !fullname || !email || !password){
       throw new apiError(400,'All Fields are Required')
    }
    const existedUser = await userModel.findOne({$or:[{username},{email}]})
    if(existedUser){
     throw new apiError(400,'User Already Exists')
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
       throw new apiError(400,'Avatar file is required')
    }
 
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
 
    try {

         const user =  await userModel.create({
             fullname,
             avatar: avatar,
             coverImage: coverImage ? coverImage : '',
             email,
             password,
             username: username.toLowerCase()
         });
        //  console.log(user)
 
         const createUser = await userModel.findById(user._id).select('-password -refreshToken')
         if(!createUser){
             throw new Error('User creation failed');
         }
         return res.status(201).json(
             new apiResponse(200,createUser,'User Registered Successfully')
         )
     } catch (error) {
         console.error("Error while creating user:", error);
         throw new apiError(500,'Internal Server Error');
     }
 })
 

 export const loginUser = asyncHandler(async(req,res)=>{
   const { email, username, password } = req.body;
   if(!(username || email )){
     throw new apiError(400,'username or email is required')
   }
   const user = await userModel.findOne({$or:[{username},{email}]})
   if(!user){
    throw new apiError(404,'User does not exists')
   }
   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new apiError(404,'Invalid user credentials')
   }
   const { accessToken, refreshToken } =  await generateAccessAndRefreshTokens(user._id)
   const loggedInUser = await userModel.findById(user._id).select('-password -refreshToken')
   const options ={
    httpOnly:true,
    secure:true
   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new apiResponse(200,{
        user:loggedInUser, accessToken, refreshToken
    })
   )
 })




 export const logoutUser = asyncHandler(async(req,res)=>{
     await userModel.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1
        }
     },{
        new:true
     })
     const options ={
        httpOnly:true,
        secure:true
       }
     return res.status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new apiResponse(200,{},"User Logged Out"))

 })


export const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
      throw new apiError(401,'unauthorized request')
  }
 try {
     const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user =  await userModel.findById(decodedToken?._id)
     if(!user){
       throw new apiError(401,"Invalid Refresh Token")
     }
     if(incomingRefreshToken !== user?.refreshToken){
       throw new apiError(401,"Refresh Token is expired or used")
     }
     const options ={
       httpOnly:true,
       secure:true
     }
       const { accessToken, newRefreshToken } =await generateAccessAndRefreshTokens(user._id)
       return res.status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken, options)
       .json( new apiResponse(200,{accessToken,refreshToken:newRefreshToken},'Access Token Refreshed Successfully'))
 } catch (error) {
    throw new apiError(401,error?.message,'Invalid Refresh Token')
 }
})




export const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const { oldPassword, newPassword } = req.body
  const user = await userModel.findById(req.user._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new apiError(400,"Invalid Old Password")
  }
  user.password = newPassword
  await user.save()
  return res.status(200).json(new apiError(200,{},"Password Changed"))
})


export const updateAccountDetails = asyncHandler(async(req,res)=>{
  const { fullName, email } = req.body
  if(!fullName || !email){
    throw new apiError(400,"All fields are required")
  }
  const user = await userModel.findByIdAndUpdate(req.user._id,{$set:{username,email}},{new:true}).select("-password")
  return res.status(200).json(200,user,'Account details updated successfully')

})


export  const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath){
    throw new apiError(400,'avatar localpath is required')
  } 
  const avatar =  await uploadOnCloudinary(avatarLocalPath)
  if(avatar.url){
    throw new apiError(400,'Error while uploading on avatar')
  }
  const user =  await userModel.findByIdAndUpdate(req.user._id,{$set:{ avatar:avatar.url }},{new:true}).select('-password')
   return res.status(200).json(
    new apiResponse(200,user,'avatar image uploaded successfully')
   )

})






