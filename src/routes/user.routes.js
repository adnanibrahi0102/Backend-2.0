import { Router } from 'express';
import { changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
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
router.route("/getCurrentUser").post(verifyJwt,getCurrentUser); 


export default router;