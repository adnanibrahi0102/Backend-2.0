import mongoose,{Schema} from "mongoose";

const userSubscription = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});


export const UserSubscription  = mongoose.model("UserSubscription" ,userSubscription);