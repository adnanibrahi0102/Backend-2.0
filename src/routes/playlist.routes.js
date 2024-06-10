import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createPlayList, getUserPlayLists } from "../controllers/playlist.controller.js";


const router =  Router();


router.route("/create-playlist").post(verifyJwt , createPlayList);

router.route("/get-user-playlist").get(verifyJwt ,getUserPlayLists)

export default router;