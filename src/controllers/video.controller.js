import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
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
