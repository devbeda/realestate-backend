import mongoose from "mongoose";

const viewsSchema = mongoose.Schema({
  propertyId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  ],
  viewersId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Views = mongoose.model("Views", viewsSchema);
