import dotenv from 'dotenv'
import connectDB from "./db/db.js";
import { app } from './app.js'

dotenv.config({
    path: './env'
})

connectDB()
    .then(() => {
        app.on("ERROR", (error) => {
            console.log("ERROR", error);
            process.exit(1);
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is listening on port  ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log("MongoDb connection FAILED!!! ", error);
        throw error;
    })




































/*
import mongoose from "mongoose";
import DB_NAME from './constants.js'

import express from 'express'

const app = express();
;( async () => {
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      app.on("ERROR",(error)=>{
         console.log("ERROR",error);
         throw error
      });

      app.listen(process.env.PORT , () =>{
         console.log(`App is listening on port ${process.env.PORT}`);
      })
    } catch (error) {
        console.log("MongoDb connection FAILED !!! " , error);
        throw error;
    }
})()
*/