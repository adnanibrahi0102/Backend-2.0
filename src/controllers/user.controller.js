import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/apiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';

const generateAccessAndRefreshToken = async (userId) => {
     try {
          const user = await User.findById(userId);
          const accessToken = user.generateAccessToken();
          const refreshToken = user.generateRefreshToken();

          user.refreshToken = refreshToken;
          await user.save({ validateBeforeSave: false });

          return { accessToken, refreshToken }
     } catch (error) {
          throw new ApiError(500, "something went wrong during generateAccessAndRefreshToken")
     }
}

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
          throw new ApiError(500, "Something went wrong while registering user");
     }
     return res.status(201).json(
          new ApiResponse(200, createdUser, "User registered successfully")
     )


})

export const loginUser = asyncHandler(async (req, res) => {
     /*
       ******ALOGORITHM******
       - get data from req.body 
       - check username or email 
       - find user 
       - if user - check password
       - if!password - throw error
       - access and refresh token
       - send cookies
       - send response
     */

     const { username, email, password } = req.body

     if (!(username || email)) {
          throw new ApiError(400, " username or email is required")
     }

     const user = await User.findOne({
          $or: [{ username }, { email }]
     }).select("+password")


     if (!user) {
          throw new ApiError(404, "user does not exist")
     }

     const isPasswordValid = await user.isPasswordValid(password);

     if (!isPasswordValid) {
          throw new ApiError(404, "Invalid User Credentials");
     }

     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

     const options = {
          httpOnly: true,
          secure: true,
     }

     return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
               new ApiResponse(
                    200,
                    {
                         user: loggedInUser, accessToken, refreshToken
                    },
                    "User logged in successfully"
               )
          )

})


export const logoutUser = asyncHandler(async (req, res) => {
     User.findByIdAndUpdate(
          req.user._id,
          {
               $set: {
                    refreshToken: null  //we can also use $unset and pass a flag 1
               }
          },
          {
               new: true, 

          },

     )
     const options = {
          httpOnly: true,
          secure: true,
     }
     return res
          .status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(
               new ApiResponse(
                    200,
                    {},
                    "User logged out successfully"
               )

          )
})

export const refreshAccessToken = asyncHandler(async (req, res) => {

     const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

     if (!incommingRefreshToken) {
          throw new ApiError(401, "unAuthorized request")
     }

     const decodedToken = jwt.verify(
          incommingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET,

     )
     const user = await User.findById(decodedToken._id);

     if (!user) {
          throw new ApiError(401, "invalid refresh token")
     }

     if (incommingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired")
     }

     const options = {
          httpOnly: true,
          secure: true,
     }

     const { newRefreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

     res.status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", newRefreshToken, options)
          .json(
               new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"

               )
          )


})

export const changePassword = asyncHandler(async (req, res) => {
     const { oldPassword, newPassword } = req.body;

     if (!(oldPassword && newPassword)) {
          throw new ApiError(400, "All fields are required")
     }
     const user = await User.findById(req.user._id);


     const isValidPassword = await user.isPasswordValid(oldPassword);

     if (!isValidPassword) {
          throw new ApiError(400, "Invalid  old Password")
     }
     user.password = newPassword;
     await user.save({ validateBeforeSave: false });
     return res.status(200).json(
          new ApiResponse(200, {}, "Password changed successfully")
     )
})

export const getCurrentUser = asyncHandler(async (req, res) => {
     return res
          .status(200)
          .json(
               new ApiResponse(
                    200,
                    {
                         user: req.user
                    },
                    " current user Fetched successfully"
               )
          )
})

export const updateAvatar = asyncHandler(async (req, res) => {

     const avatarLocalPath = req.file?.path
     if (!avatarLocalPath) {
          throw new ApiError(400, "Avatar file is missing");
     }
     const avatar = await uploadOnCloudinary(avatarLocalPath);

     if (!avatar.url) {
          throw new ApiError(500, " update Avatar upload failed");
     }
     const user = await User.findByIdAndUpdate(
          req.user._id,
          {
               $set: { avatar: avatar.url }
          },
          { new: true }
     ).select("-password");
     // TODO: DELETE AVATAR FROM CLOUDINARY

     res.
          status(200)
          .json(
               new ApiResponse(200, user, "Avatar updated successfully")

          )

})

export const updateCoverImage = asyncHandler(async (req, res) => {

     const coverImageLocalPath = req.file?.url;
     if (!coverImageLocalPath) {
          throw new ApiError(400, "Cover Image file is missing");
     }
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);
     if (!coverImage.url) {
          throw new ApiError(500, " update Cover Image upload failed");
     }

     const user = await User.findByIdAndUpdate(
          req.user._id,
          {
               $set: {
                    coverImage: coverImage.url
               }
          },
          { new: true }
     )
     res
          .status(200)
          .json(
               new ApiResponse(200, user, "Cover Image updated successfully")
          )
})

// *********Aggregation Pipeline's********* //

export const getUserChannelProfile = asyncHandler(async (req, res) => {
     // getting username from url
     const { username } = req.params;

     if (!username?.trim()) {
          throw new ApiError(400, "username is missing")
     }

     const channel = await User.aggregate([
          {
               $match: {
                    username: username.toLowerCase(),
               }
          },
          {
               $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
               }
          },
          {
               $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
               }
          },
          {
               $addFields: {
                    subscribersCount: {
                         $size: "$subscribers"
                    }
                    ,
                    channelsSubscribedToCount: {
                         $size: "$subscribedTo"
                    },
                    isSubscribed: {
                         $cond: {
                             if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                             then: true,
                             else: false
                         }
                     }
                     
               }
          },
          {
               $project:{
                    fullname:1,
                    username:1,
                    subscribersCount:1,
                    channelsSubscribedToCount:1,
                    isSubscribed :1,
                    avatar:1,
                    coverImage:1

               }
          }


     ]);

     console.log("channel: " + channel);
     if (!channel?.length) {
          throw new ApiError(404, "channel does'nt exist")
     }

     return res
     .status(200)
     .json(
          new ApiResponse(200, channel[0], "channel profile fetched successfully")
     )
})

export const getWatchHistory = asyncHandler(async (req, res) => {
     const userId = req.user?._id;
 
     if (!userId) {
         throw new ApiError(400, "User ID is missing");
     }
 
     const user = await User.aggregate([
         {
             $match: {
                 _id: new mongoose.Types.ObjectId(userId)
             }
         },
         {
             $lookup: {
                 from: 'videos',
                 localField: 'watchHistory',
                 foreignField: '_id',
                 as: 'watchHistory',
                 pipeline: [
                     {
                         $lookup: {
                             from: 'users',
                             localField: 'owner',
                             foreignField: '_id',
                             as: 'owner',
                             pipeline: [
                                 {
                                     $project: {
                                         fullname: 1,
                                         username: 1,
                                         avatar: 1
                                     }
                                 }
                             ]
                         }
                     },
                     {
                         $addFields: {
                             owner: {
                                 $first: '$owner'
                             }
                         }
                     }
                 ]
             }
         }
     ]);
 
     if (!user.length) {
         throw new ApiError(404, "User not found");
     }
 
     return res
         .status(200)
         .json(
             new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
         );
 });