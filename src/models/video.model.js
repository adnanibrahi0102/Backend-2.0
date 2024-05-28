import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: [true, "video file is required"]
        },
        thumbnail: {
            type: String, //cloudinary url
            required: [true, "thumbnail file is required"]
        },
        title: {
            type: String,
            required: [true, "title is required"]
        },
        description: {
            type: String,
            required: [true, "description is required"]
        },
        duration: {
            type: String,
            required: [true, "duration is required"]
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        }, videoOwner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "video owner is required"]
        }
    }
    , { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);