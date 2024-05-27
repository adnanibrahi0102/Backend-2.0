import { Router } from 'express';
import { changePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';


const router = Router();
//this route is using multer middleware
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// this route is using verifyJwt middleware
router.route("/logout").post( verifyJwt , logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt,changePassword);
router.route("/getCurrentUser").get(verifyJwt,getCurrentUser); 
router.route("update-avatar").patch(verifyJwt , upload.single("avatar"),updateAvatar);
router.route("update-coverImage").patch(verifyJwt , upload.single("coverImage"),updateCoverImage);

router.route("/channel/:username").get(verifyJwt , getUserChannelProfile);
router.route("/history").get(verifyJwt , getWatchHistory);


export default router;