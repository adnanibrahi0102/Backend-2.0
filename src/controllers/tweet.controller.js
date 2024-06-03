import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";





export const createTweet = asyncHandler(async (req, res)=>{
    const {tweet} = req.body;

    if(!tweet){
        throw new ApiError(404, "Tweet field is required" )
    }

    const newTweet = await Tweet.create(
        {
            tweet: tweet,
            owner:req.user._id
        }
    )

    if(!newTweet){
        throw new ApiError(400, "Tweet could not be created")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201 , newTweet, "Tweet created successfully")
    )
});

export const upadteTweet = asyncHandler(async (req ,res)=>{
    const {content} = req.body;
    const {tweetId} = req.params;


    if(!content || !tweetId){
        throw new ApiError(404, "Tweet field or TweetId  is required" )
    }

    if(!isValidObjectId(tweetId)){
        throw new 
        ApiError(400, "TweetId is not valid")
    }

   const tweet = await Tweet.findById(tweetId);

   if(!tweet){
    throw new ApiError(404, "Tweet not found")
   }

   if(tweet?.owner.toString() !== req.user?._id.toString()){
    throw new ApiError(401, "You are not authorized to update this tweet")
   }

   const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
     {
        $set:{
            tweet:content
        }
     },
     {
        new:true
     }
   )

   if(!updatedTweet){
    throw new ApiError(400, "Tweet could not be updated")
   }

   return res
   .status(200)
   .json(
       new ApiResponse(200, updatedTweet, "Tweet updated successfully")
   )
})