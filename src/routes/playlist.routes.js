import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlayList, deletePlayList, getUserPlayLists, removeVideoFromPlaylist, updatePlayList } from "../controllers/playlist.controller.js";


const router =  Router();


router.route("/create-playlist").post(verifyJwt , createPlayList);

router.route("/get-user-playlist").get(verifyJwt ,getUserPlayLists);

router.route("/addvideo/:playListId/:videoId").patch(verifyJwt , addVideoToPlayList);

router.route("/delete-playList/:playListId").delete(verifyJwt , deletePlayList);

router.route("/update-playList/:playListId").patch(verifyJwt , updatePlayList);

router.route("/remove-video/:playListId/:videoId").delete(verifyJwt , removeVideoFromPlaylist);

export default router;