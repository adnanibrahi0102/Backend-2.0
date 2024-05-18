import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // index is used for optimized searching 
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: [true, "fullname is required"],
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary url
            required: [true, "avatar is required"],

        },
        coverImage: {
            type: String, //cloudinary url

        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "password is required"],
            minlength: [6, "password must be at least 6 characters"],
            select: false
        },
        refreshToken: {
            type: String,

        }
    }
    , { timestamps: true });




userSchema.pre("save", async function (next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
});

userSchema.methods.isPasswordValid = async function (password) {
    console.log('Plain text password:', password);
    console.log('Hashed password:', this.password);
    return await bcrypt.compare(password, this.password)


}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        //Payload
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,

        },
        process.env.ACCESS_TOKEN_SECRET,

        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,

        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

export const User = mongoose.model("User", userSchema);