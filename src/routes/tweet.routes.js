import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getAllTweets, getAllTweetsOfUser, upadteTweet } from "../controllers/tweet.controller.js";



const router = new Router();

router.route("/post-tweet").post(verifyJwt , createTweet);

router.route("/update-tweet/:tweetId").patch(verifyJwt , upadteTweet);

router.route("/getAll-userTweets/:userId").get(verifyJwt ,getAllTweetsOfUser);

router.route("/getAll-Tweets").get(verifyJwt ,getAllTweets);

router.route("/delete-tweet/:tweetId").delete(verifyJwt , deleteTweet);

export default router