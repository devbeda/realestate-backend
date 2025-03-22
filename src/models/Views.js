import mongoose from "mongoose";

const viewsSchema = mongoose.Schema({
  propertyId: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  
  viewersId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export const Views = mongoose.model("Views", viewsSchema);
