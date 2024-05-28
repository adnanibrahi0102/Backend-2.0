import {Comment } from   '../models/comment.model.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiResponse.js'


export const getVideoComments =asyncHandler(async(req,res)=>{
     //TODO: get all comments for a video
     const {videoId} = req.params
     const {page = 1, limit = 10} = req.query
});

export const addComment = asyncHandler( async (req,res )=>{
    // Add a comment to the video
    //video id from req.params
    //Comment content and user information from req.body
    
});

export const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
});

export const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})