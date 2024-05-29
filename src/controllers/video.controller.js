import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import mongoose, { isValidObjectId } from "mongoose"
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  //*******Algorithm******** */
  //1. get videoId from req.params
  const { id } = req.params;

  //2. check if videoId exist
  if (!id) {
    throw new ApiError(400, "videoId is required");
  }
  //3. Optionally, check if the ID is a valid ObjectId
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "videoId is not valid");
  }
  //4. get video from database
  const video = await Video.findById(id);

  //5. check if video exist
  if (!video) {
    throw new ApiError(400, "video not found");
  }
  //6. sending response to client
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "video fetched successfully"
      )
    )
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