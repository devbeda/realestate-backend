// const mongoose = require("mongoose");
import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  renewalPrice: { 
    type: Number, 
    required: true 
  },
  propertyLimit: { 
    type: Number, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  }, // in days
  
});

export const Plan = mongoose.model("Plan", PlanSchema);
