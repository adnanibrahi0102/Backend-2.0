import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { commentLike, getLikedVideos, tweetLike, videoLike } from "../controllers/like.controller.js";


const router = Router();

router.route("/like-video/:videoId").post(verifyJwt , videoLike);

router.route("/like-comment/:commentId").post(verifyJwt , commentLike);

router.route("/like-tweet/:tweetId").post(verifyJwt , tweetLike);

router.route("/get-All-LikedVideos").get(verifyJwt , getLikedVideos)

export default router;