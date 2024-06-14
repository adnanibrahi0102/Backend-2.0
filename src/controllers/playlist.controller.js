import { PlayList } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiResponse.js'
import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from "../models/video.model.js";




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
});

export const deletePlayList = asyncHandler(async (req, res)=>{
    const {playListId} = req.params;

    if(!playListId){
        throw new ApiError(400, "playListId is required")
    }

    if(!isValidObjectId(playListId)){
        throw new ApiError(400, "playListId is not valid")
    }

    const playList = await PlayList.findById(playListId);

    if(playList.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(401, "You are not authorized to delete this playlist")
    }

    const deletePlayList = await PlayList.findByIdAndDelete(playListId);

    if(!deletePlayList){
        throw new ApiError(400, "PlayList could not be deleted")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "PlayList deleted successfully")
    )
});

export const updatePlayList = asyncHandler(async(req,res)=>{
    const {playListId} = req.params;
    const {name, description} = req.body;

    if(!(name || description)){
        throw new ApiError(400, "name and description are required")
    }
    if(!playListId){
        throw new ApiError(400, "playListId is required")
    }

    if(!isValidObjectId(playListId)){
        throw new ApiError(400, "playListId is not valid")
    }

    const playList = await PlayList.findById(playListId);
    if(playList.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(401, "You are not authorized to update this playlist")
    }
    const updatedPlayList = await PlayList.findByIdAndUpdate(
        playListId,
        {
            $set:{
                name:name,
                description:description
            }
        },
        {new:true}
    )

    if(!updatePlayList){
        throw new ApiError(400, "PlayList could not be updated")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlayList, "PlayList updated successfully")
    )
});

export const addVideoToPlayList = asyncHandler(async(req , res)=>{
    const {playListId , videoId} = req.params;

    if(!(playListId && videoId)){
        throw new ApiError(400, "playListId and videoId are required")
    }

    if(!(isValidObjectId(playListId) && isValidObjectId(videoId)) ){
        throw new ApiError(400, "playListId and videoId are not valid")
    }

    const playList = await PlayList.findById(playListId);
    const video = await Video.findById(videoId);

    if (
        (playList.owner?.toString() || video.owner?.toString()) !==
        req.user?._id?.toString()
      ){
        throw new ApiError(401, "You are not authorized to add this video to this playlist")
      }

    const updatedPlayList = await PlayList.findByIdAndUpdate(
        playListId,
        {
            $push:{
                videos:videoId
            }
        },
        {new:true}
    );

    if(!updatePlayList){
        throw new ApiError(400, "PlayList could not be updated")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, updatedPlayList, "video added to playlist successfully")
    )
});

export const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {playListId , videoId} = req.params;

    if(!(playListId && videoId)){
        throw new ApiError(400, "playListId and videoId are required")
    }

    if(!(isValidObjectId(playListId) && isValidObjectId(videoId)) ){
        throw new ApiError(400, "playListId and videoId are not valid")
    }

    const playList = await PlayList.findById(playListId);
    const video = await Video.findById(videoId);

    if(!playList){
        throw new ApiError(404, "PlayList not found")
    }
    if(!video){
        throw new ApiError(404, "video not found")
    }

    if (
        (playList.owner?.toString() && video.owner?.toString())!==
        req.user?._id?.toString()
      ){
        throw new ApiError(401, "You are not authorized to remove this video from this playlist")
      }
    
    const updatedPlayList = await PlayList.findByIdAndDelete(
        playList,
        {
            $pull:{
                videos:videoId
            }

        },
        {new:true}
    )

    if(!updatePlayList){
        throw new ApiError(400, "PlayList could not be updated")
    }

    return res
   .status(200)
   .json(
        new ApiResponse(200, updatedPlayList, "video removed from playlist successfully")
    )
    
})