import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { publishVideo } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/publish-video").post(verifyJwt,
    upload.fields([
        {name:"videoFile" ,maxCount :1},
        {name:"thumbnail", maxCount:1}
    ]),
    publishVideo
)

export default router;