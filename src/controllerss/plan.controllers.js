import mongoose from "mongoose";
import { Plan } from "../models/Plan.js";

export const createPlan = async (req, res) => {
  try {
    console.log("From body:", req.body);
    
    const { name, price, propertyLimit, renewalPrice, duration } = req.body ;
    if (!name || price === undefined || !renewalPrice || !propertyLimit || !duration ) {
      return res.status(400).json({ message: "All fields are require" });
    }

    const isAlreadyExists = await Plan.findOne({ name: name });
    if (isAlreadyExists)
      return res.status(400).json({ message: "Plan already exists" });

    const newPlan = new Plan({
      name,
      price,
      propertyLimit,
      duration,
    });
    await newPlan.save();
    res.status(201).json({ message: "Plan created successfully",newPlan });
  } catch (error) {
    console.error(" Error creating plan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    return res
      .status(200)
      .json({ message: "All plans are successgully fetched", plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    if (!planId)
      return res.status(400).json({ message: "Plan Id is requred." });

    const updates = req.body;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedPlan)
      return res.status(404).json({ message: "Can't update your plan" });
    return res
      .status(200)
      .json({ message: "Plan updated successfully", updatedPlan });
  } catch (error) {
    console.error("Error updating plan:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    if (!planId)
      return res.status(400).json({ message: "Plan Id is required." });

    const deletedPlan = await Plan.findByIdAndDelete(planId);
    if (!deletedPlan)
      return res.status(404).json({ message: "Plan not found" });
    return res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
