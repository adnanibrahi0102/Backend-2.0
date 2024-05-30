import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import mongoose, { Mongoose, isValidObjectId } from "mongoose"
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

export const publishVideo = asyncHandler(async (req, res) => {
  //******** Algorithm***********

  //1. get title and description from req.body

  const { title, description } = req.body;

  //2. check if title and description exist

  if (!(title && description)) {
    throw new ApiError(400, "No title or description");
  }
  //3. getting  video and thumbnail path from req.files

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  //4. checking if videoPath and thumbnailPath exist

  if (!(videoLocalPath && thumbnailLocalPath)) {
    throw new ApiError(400, " video or thumbnail are required");
  }
  //4. uploading video and thumbnail to cloudinary

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  console.log("video", video)
  console.log("thumbnail", thumbnail)

  //6.checking both video and thumbnail uploads were successfulL

  if (!(video && thumbnail)) {
    throw new ApiError(400, " video or thumbnail upload failed");
  }

  //7. FINALLY creating a video with all details in Database

  const newVideo = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    videoOwner: req.user._id,
  });
  //8. sending response to client
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video: newVideo, owner: req.user.username },
        "video uploaded successfully"
      )
    );
});


export const getVideoById = asyncHandler(async (req, res) => {
  // 1. Get videoId from req.params
  const { id } = req.params;

  // 2. Check if videoId exists
  if (!id) {
    throw new ApiError(400, "videoId is required");
  }

  // 3. Optionally, check if the ID is a valid ObjectId
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "videoId is not valid");
  }

  // Perform aggregation query to fetch video details
  const video = await Video.aggregate([
    {
      // Match the provided videoId
      $match: {
        _id: new mongoose.Types.ObjectId(id)
      }
    },
    {
      // Perform a lookup to retrieve likes associated with the video
      $lookup: {
        from: 'likes', // Look up the 'likes' collection
        localField: '_id', // Match with the '_id' field of the current collection (videos)
        foreignField: 'video', // Match with the 'video' field of the 'likes' collection
        as: 'likes' // Store the results in the 'likes' array field
      }
    },
    {
      // Perform a lookup to retrieve owner details
      $lookup: {
        from: "users", // Look up the 'users' collection
        localField: "videoOwner", // Match with the 'videoOwner' field of the current collection (videos)
        foreignField: "_id", // Match with the '_id' field of the 'users' collection
        as: "owner", // Store the results in the 'owner' array field
        pipeline: [
          {
            // Lookup subscriptions of the owner
            $lookup: {
              from: "subscriptions", // Look up the 'subscriptions' collection
              localField: "_id", // Match with the '_id' field of the current collection (users)
              foreignField: "channel", // Match with the 'channel' field of the 'subscriptions' collection
              as: "subscribers" // Store the results in the 'subscribers' array field
            }
          },
          {
            // Calculate subscribers count and check if the current user is subscribed
            $addFields: {
              subscribersCount: { $size: "$subscribers" }, // Calculate the size of the 'subscribers' array
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"] // Check if the current user is in the 'subscribers' array
                  },
                  then: true,
                  else: false
                }
              }
            }
          },
          {
            // Project necessary owner details
            $project: {
              username: 1, // Include the 'username' field
              avatar: 1, // Include the 'avatar' field
              subscribersCount: 1, // Include the 'subscribersCount' field
              isSubscribed: 1 // Include the 'isSubscribed' field
            }
          }
        ]
      }
    },
    {
      // Add fields for likes count and owner details
      $addFields: {
        likesCount: { $size: "$likes" }, // Calculate the count of likes
        owner: "$owner" // Assign the 'owner' array as the 'owner' field
      }
    },
    {
      // Project necessary video details
      $project: {
        videoFile: 1, // Include the 'videoFile' field
        title: 1, // Include the 'title' field
        description: 1, // Include the 'description' field
        views: 1, // Include the 'views' field
        createdAt: 1, // Include the 'createdAt' field
        duration: 1, // Include the 'duration' field
        comments: 1, // Include the 'comments' field
        owner: 1, // Include the 'owner' field
        likesCount: 1 // Include the 'likesCount' field
      }
    }
  ]).exec(); // Execute the aggregation pipeline

  // Log the fetched video for debugging
  console.log(video);

  // Handle case where no video is found
  if (!video) {
    throw new ApiError(500, "failed to fetch video");
  }

  // Increment views count of the video
  await Video.findByIdAndUpdate(id, {
    $inc: {
      views: 1
    }
  });

  // Add this video to user's watch history
  await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: {
      watchHistory: id
    }
  });

  // Return the response with fetched video details
  return res.status(200).json(new ApiResponse(200, video[0], "video details fetched successfully"));
});






export const deleteVideo = asyncHandler(async (req, res) => {
  //1 getting id from req.params
  const { id } = req.params;
  //2 check if videoId exist
  if (!id) {
    throw new ApiError(400, "videoId is required");
  }
  //3 Optionally, check if the ID is a valid ObjectId
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "videoId is not valid");
  }
  //4. get video from database and delete it
  const video = await Video.findByIdAndDelete(id);
  //5. check if the video exists 
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "video deleted successfully")
    )

});

export const updateVideoDetails = asyncHandler(async (req, res) => {
  //1. getting id from req.params
  const { title, description } = req.body

  //2. getting id from req.params
  const { id } = req.params

  //3.check if id exists
  if (!id) {
    throw new ApiError(400, "videoId is required");
  }
  //4. Optionally, check if the ID is a valid ObjectId
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "videoId is not valid");
  }
  //5.uplaod thumbnail to cloudinary

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!newThumbnail.url) {
    throw new ApiError(400, "thumbnail upload failed");
  }

  //6. add new values to Database

  const updatedVideoDetails = await Video.findByIdAndUpdate(
    id,
    {
      $set: {
        title,
        description,
        thumbnail: newThumbnail.url
      }
    },
    { new: true }
  )

  //7. sending response to client
  res
   .status(200)
   .json(
      new ApiResponse(
        200,
        updatedVideoDetails,
        "video details updated successfully"
      )
    )




});

export const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
})