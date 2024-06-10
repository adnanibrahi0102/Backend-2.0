import { PlayList } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiResponse.js'
import mongoose, { isValidObjectId } from 'mongoose';




export const createPlayList = asyncHandler(async(req ,res)=>{
    const { name ,  description} = req.body;

    if(!(name && description)){
        throw new ApiError(400, "name and description are required")
    }

    const newPlayList =  await PlayList.create(
        {
            name: name,
            description:description,
            owner:req.user?._id
        }
     );


     if(!newPlayList){
         throw new ApiError(400, "PlayList could not be created")
     }

    return res
    .status(200)
    .json(
        new ApiResponse(200, newPlayList, "PlayList created successfully")
    )
});

export const getUserPlayLists = asyncHandler(async (req , res)=>{
     const userId = req.user?._id;


     if(!userId){
         throw new ApiError(400, "Please login userId is required ")
     }

     const playLists = await PlayList.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $addFields:{
                totalVideos:{
                    $size:"$videos"
                },
                totalViews:{
                    $sum:"$videos.views"
                }
            }
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                totalVideos:1,
                totalViews:1,
                createdAt:1
            }
        }
     ]);

     if(!playLists){
         throw new ApiError(404, "No playlists found")
     }

     return res
     .status(200)
     .json(
         new ApiResponse(200, playLists, "playlists fetched successfully")
     )
})