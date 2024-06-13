import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlayList, getUserPlayLists } from "../controllers/playlist.controller.js";


const router =  Router();


router.route("/create-playlist").post(verifyJwt , createPlayList);

router.route("/get-user-playlist").get(verifyJwt ,getUserPlayLists)

router.route("/addvideo/:playListId/:videoId").patch(verifyJwt , addVideoToPlayList)

export default router;