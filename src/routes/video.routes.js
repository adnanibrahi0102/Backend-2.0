import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getVideoById, publishVideo, updateVideoDetails } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

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

export default router;