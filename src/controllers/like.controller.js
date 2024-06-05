import { isValidObjectId } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js'
import { Like } from '../models/like.model.js';
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"


export const videoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is not valid")
    }

    const alreadyLiked = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, { isLiked: false }, "video disliked successfully")
            )
    }



    const likeVideo = await Like.create(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )
    if (!likeVideo) {
        throw new ApiError(500, "server error: video could not be liked")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { likeVideo }, "video liked successfully")
        )
});

export const commentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "commetId is required")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "commetId is not valid")
    }

    const alreadyLiked = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }

    )

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res
            .status(200)
            .json(
                new ApiResponse(200, { isLiked: false }, "comment disliked successfully")
            )
    }

    const likeComment = await Like.create(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    if (!likeComment) {
        throw new ApiError(500, "server error: comment could not be liked")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { likeComment }, "comment liked successfully")
        )
});

export const tweetLike = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(400, "tweetId is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "tweetId is not valid")
    }

    const alreadyLiked  = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req.user._id
        }
    )
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res 
        .status(200)
        .json(
            new ApiResponse(200, {isLiked: false}, "tweet disliked successfully")
        )
    }

    const likeTweet = await Like.create(
        {
            tweet:tweetId,
            likedBy: req.user._id
        }
    )

    if(!likeTweet){
        throw new ApiError(500, "server error: tweet could not be liked")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, {likeTweet}, "tweet liked successfully")
    )
})