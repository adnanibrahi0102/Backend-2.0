import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";





export const createTweet = asyncHandler(async (req, res) => {
    const { tweet } = req.body;

    if (!tweet) {
        throw new ApiError(404, "Tweet field is required")
    }

    const newTweet = await Tweet.create(
        {
            tweet: tweet,
            owner: req.user._id
        }
    )

    if (!newTweet) {
        throw new ApiError(400, "Tweet could not be created")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, newTweet, "Tweet created successfully")
        )
});

export const upadteTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;


    if (!content || !tweetId) {
        throw new ApiError(404, "Tweet field or TweetId  is required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new
            ApiError(400, "TweetId is not valid")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "You are not authorized to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                tweet: content
            }
        },
        {
            new: true
        }
    )

    if (!updatedTweet) {
        throw new ApiError(400, "Tweet could not be updated")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedTweet, "Tweet updated successfully")
        )
})

export const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "TweetId is required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "TweetId is not valid")
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "You are not authorized to delete this tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(400, "Tweet could not be deleted")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Tweet deleted successfully")
        )


})

export const getAllTweetsOfUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "userId is required")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "userId is not valid")
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const allTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,

                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: "$likeDetails"
                },
                ownerDetails: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                tweet: 1,
                createdAt: 1,
                likeCount: 1,
                ownerDetails: 1,

            }
        }
    ]).exec();


    if (!allTweets) {
        throw new ApiError(500, "failed to fetch tweets")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, allTweets, "Tweets fetched successfully")
        )
})

export const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const allTweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likesDetails"
                },
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            },

        },
        {

            $limit: parseInt(limit)
        }, 

        
        {
            $project: {
                tweet: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                }
            }
        }

    ]).exec()

    if (!allTweets) {
        throw new ApiError(500, "failed to fetch tweets")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allTweets, "Tweets fetched successfully")
        )
})