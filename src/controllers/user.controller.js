import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/apiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
export const registerUser = asyncHandler(async (req, res) => {
     /*
     *****Alogrithm*****
     - get user details from frontend
     - validation 
     - check if user already exists
     - check for images , check for avatar 
     - upload them to cloudinary ,avatar
     - create user object - create entry in db
     - remove password and refresh token fields from response   
     - check for user creation 
     - return response object
     */

     //getting data from req.body (frontend)
     const { username, email, fullname, password } = req.body;

     /*
        * Validate that no input fields are empty. Using the `some` method, we check each value in the array
        * The `some` method tests whether at least one element in the array passes the provided function.
        * In this case, the function checks if the trimmed value of any field is an empty string.
        * If any field is empty (contains only whitespace), an ApiError with a 400 status code is thrown, indicating that all fields are required.
     */
     if ([username, email, fullname, password].some((value) => value.trim() === "")) {
          throw new ApiError(400, "All fields are required")
     }

     // check if user already exists

     const existingUser = await User.findOne({
          $or: [{ username }, { email }]
     });

     if (existingUser) {
          throw new ApiError(409, "User with email or username already exists")
     }

     // getting files for req.files using multer- check for images , check for avatar
     const avatarLocalPath = req.files?.avatar[0]?.path;
     // check for cover image 
     const coverImageLocalPath = req.files?.coverImage?.[0]?.path ?? null;

     // let coverImageLocalPath ; // another syntax
     // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0]){
     //      coverImageLocalPath = req.files.coverImage[0].path
     // }

     if (!avatarLocalPath) {
          throw new ApiError(400, "Avatar is required")
     }
     //  upload these images to cloudinary

     const avatar = await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if (!avatar) {
          throw new ApiError(500, "Avatar upload failed")
     }

     // create user - create entry in db

     const user = await User.create({
          fullname,
          avatar: avatar.url,
          coverImage: coverImage?.url || "",
          username,
          email,
          password
     })
     // remove password and refresh token fields from response
     const createdUser = await User.findById(user._id).select("-password -refreshToken");

     if (!createdUser) {
          throw new ApiError(500, "something went wrong while registering user");
     }
     return res.status(201).json(
          new ApiResponse(200, createdUser, "User registered successfully")
     )





})

