import mongoose from "mongoose";

const favoriteSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  propertyId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  ],
});

export const Favorite = mongoose.model("Favorite", favoriteSchema);