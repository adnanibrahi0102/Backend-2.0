import mongoose, { Schema } from "mongoose";

const playListSchema = new Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    description: {
        type: String,
        required: [true, "description is required"]
    },
    videos: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });


export const PlayList = mongoose.model("PlayList", playListSchema);