import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet, upadteTweet } from "../controllers/tweet.controller.js";


const router = new Router();

router.route("/post-tweet").post(verifyJwt , createTweet);

router.route("/update-tweet/:tweetId").patch(verifyJwt , upadteTweet);

export default router