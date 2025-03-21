import mongoose from "mongoose";

const reviewShema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    properId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    stars:{
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
})

export const Review = mongoose.model("Review", reviewShema);