import {Comment } from   '../models/comment.model.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiResponse.js'
import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.js';



export const getVideoComments =asyncHandler(async(req,res)=>{
     //TODO: get all comments for a video
     const {videoId} = req.params
     const {page = 1, limit = 10} = req.query

     if(!videoId){
        throw new ApiError(400 , "videoId is required")
     }
     if(!isValidObjectId(videoId)){
         throw new ApiError(400 , "invalid videoId")
     }

     const getComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: '$owner',
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                }
            }
        }
    ]).exec();
    
  
     if(!getComments){
         throw new ApiError(500, "failed to fetch comments")
     }
     const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };
    
      const comments = await Comment.aggregatePaginate(getComments, options);
    
      if (!comments) {
        throw new ApiError(500, "Error while loading comments section");
      }
    
      return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully!"));



});

export const addComment = asyncHandler( async (req,res )=>{
    // Add a comment to the video
    //video id from req.params
    //Comment content and user information from req.body
    const {id} = req.params;
    const {content } = req.body;

    if(!id || !content){
        throw new ApiError(400, "videId and content are required");
    }
    if(!isValidObjectId(id)){
        throw new ApiError(400, "videId is not valid");
    }

    const video = await Video.findById(id);

    if(!video){
        throw new ApiError(404, "video not found");
    }
    if(!req.user._id){
        throw new ApiError(401, "User is not logged in");
    }

    const comment =  await Comment.create(
        {
            content,
            video: id,
            owner: req.user._id,
        }
    );
    if(!comment){
        throw new ApiError(400, "comment could not be created");
    }
//    const populatedComment = await Comment.populate("owner", "username")
   return res
    .status(201)
    .json(
        new ApiResponse(201, comment, "comment added successfully")
    )



    
});

export const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} =  req.params;
    const {content } = req.body;

    if(!commentId || !content){
        throw new ApiError(400, "commmentId and content are required");
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "commmentId is not valid");
    }

    const comment = await Comment.findById(commentId);
    if(comment?.owner.toString() !== req.user?.id.toString()){
        throw new ApiError(401, "You are not authorized to update this comment");
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new:true}
    );
    if(!updatedComment){
        throw new ApiError(400, "comment could not be updated");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "comment updated successfully")
    )
});

export const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
   const {commentId} = req.params;
   
   if(!commentId){
    throw new ApiError(400, "commentId is required");
   }
   if(!isValidObjectId(commentId)){
    throw new ApiError(400, "commentId is not valid");
   }

   const comment =  await Comment.findById(commentId);

   if(!comment){
    throw new ApiError(404, "comment not found");
   }

   if(comment?.owner.toString() !== req.user?._id.toString() ){
        throw new ApiError(401, "You are not authorized to delete this comment");
   }

   const deletedComment = await Comment.findByIdAndDelete(commentId);

   if(!deletedComment){
       throw new ApiError(400, "comment could not be deleted");
   }
   
   return res
   .status(200)
   .json(
        new ApiResponse(200, {}, "comment deleted successfully")
    )
   

})