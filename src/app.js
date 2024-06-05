import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({
    limit:'15kb'
}));
app.use(express.urlencoded({extended: true ,limit:'16kb'}));
app.use(express.static("public"));
app.use(cookieParser());


/*routes import */

import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import tweeRouter from './routes/tweet.routes.js'
import likeRouter from './routes/like.routes.js'
//routes declarations

/* User Route */
app.use('/api/v1/users',userRouter);

/* Videos Route */
app.use('/api/v1/videos',videoRouter);

/* Tweet Route */

app.use("/api/v1/tweets",tweeRouter);

/* likes route */

app.use("/api/v1/likes",likeRouter)
export {app}; 