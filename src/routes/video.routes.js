import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updateVideoDetails } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/publish-video").post(verifyJwt,
    upload.fields([
        {name:"videoFile" ,maxCount :1},
        {name:"thumbnail", maxCount:1}
    ]),
    publishVideo
)

router.route("/get-single-video/:id").get(verifyJwt , getVideoById);

router.route("/delete-video/:id").delete(verifyJwt , deleteVideo);

router.route("/update-video/:id").patch(verifyJwt , upload.single("thumbnail"),updateVideoDetails);

router.route("/getAll-videos-of-user").get(verifyJwt , getAllVideos)


//comment routes

router.route("/post-comment/:id").post(verifyJwt , addComment);

router.route("/delete-comment/:commentId").delete(verifyJwt , deleteComment);

router.route("/update-comment/:commentId").patch(verifyJwt , updateComment);

router.route("/get-comments/:videoId").get(verifyJwt , getVideoComments)

export default router;