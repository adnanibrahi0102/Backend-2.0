import {asyncHandler} from  '../utils/asyncHandler.js'
import ApiError from '../utils/apiError.js';

export const registerUser = asyncHandler( async(req , res) => {
     //get user details from frontend
     //validation 
     // check if user already exists
     // check for images , check for avatar 
     // upload them to cloudinary

     const {username , email , fullname , password} = req.body;

     if([username, email, fullname,password].some((value)=>value?.trim() === "")){
          throw new ApiError(400 , "All fields are required")
     }

     
})

