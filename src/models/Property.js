// const mongoose = require("mongoose");
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    videos: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved","rejected"],
      default: "pending",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

propertySchema.methods.getAverageRating = async function () {
  const Review = mongoose.model("Review");

  const reviews = await Review.find({ propertyId: this._id });
  if (reviews.length === 0) return 0;

  
  const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
  const avgRating =  totalStars / reviews.length;

  return parseFloat(avgRating.toFixed(1))
}
export const Property = mongoose.model("Property", propertySchema);
// videos,category, property Area(squre feet),
// property review, views
