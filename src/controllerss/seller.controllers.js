import cloudinary from "../config/cloudinary.js";
import { Seller } from "../models/Seller.js";
import { Plan } from "../models/Plan.js";
import { Property } from "../models/Property.js";
import bcrypt from "bcryptjs";
import fs from "fs";

const generateAccessToken = async (userId) => {
  try {
    const seller = await Seller.findOne({ _id: userId });
    const accessToken = seller.generateAccessToken();

    await seller.save({ validateBeforeSave: false });

    return accessToken;
  } catch (error) {
    return error.message;
  }
};

export const registerSeller = async (req, res) => {
  try {
    const { name, phone, password, locationProof, aadharNumber } = req.body;
    const planId = req.params.id;

    if (!name || !phone || !locationProof || !planId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!planId) {
      return res.status(400).json({ message: "Select One Plan" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aadhar proof is required" });
    }

    const existingSeller = await Seller.findOne({ phone });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    let aadharImgResult;
    try {
      aadharImgResult = await cloudinary.uploader.upload(req.file.path);
    } catch (uploadError) {
      fs.unlinkSync(req.file.path); // Delete the file if upload fails
      return res
        .status(500)
        .json({ message: "Failed to upload Aadhaar proof" });
    }
    fs.unlinkSync(req.file.path);

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const planStartingDate = new Date(Date.now());

    const planExpiryIn = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000
    );

    const seller = new Seller({
      name,
      phone,
      password: hashPassword,
      plan: planId,
      aadhaarProof: aadharImgResult.secure_url,
      aadharNumber,
      locationProof,
      planStartingDate,
      planExpiryDate: planExpiryIn,
    });

    await seller.save();
    const newSeller = await Seller.findById(seller._id).select("-password");

    res
      .status(201)
      .json({ message: "Seller registered successfully", newSeller });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path); // Delete the file if an error occurs
    }
    res.status(500).json({ message: "Got Error in Register Seller " });
    console.error(error);
  }
};

export const logInSeller = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    const seller = await Seller.findOne({ phone });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const isMatch = await seller.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (seller.status === "pending") {
      return res.status(200).json({
        message: "Your Account is under evaluate. It may take some time ",
      });
    }

    if (seller.status === "rejected") {
      return res.status(201).json({
        message:
          "Your Account is rejected. Please contact to admin for more information.",
      });
    }

    const loginSeller = await Seller.findById(seller._id).select("-password");

    const accessToken = await generateAccessToken(seller._id);
    if (!accessToken) {
      return res
        .status(500)
        .json({ message: "Failed to generate access token" });
    }

    res.status(200).cookie("accessToken", accessToken).json({
      message: "Logged in successfully",
      loginSeller,
      accessToken: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Got Error in Login Seller " });
    console.error(error);
  }
};

export const getSeller = async (req, res) => {
  try {
    const sellerAcc = await Seller.findById(req.user._id).select("-password");
    res
      .status(200)
      .json({ message: "Seller account fetched successfully", sellerAcc });
  } catch (error) {
    res.status(500).json({ message: "Got Error in Get Seller " });
    console.error(error);
  }
};

export const logOutSeller = async (req, res) => {
  try {
    res.clearCookie("accessToken").json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Got Error in Logout Seller " });
    console.error(error);
  }
};

export const updateSeller = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const seller = await Seller.findByIdAndUpdate(sellerId, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }
    res.status(200).json({ message: "Seller updated successfully", seller });
  } catch (error) {
    res.status(500).json({ message: "Got Error in Update Seller " });
    console.error(error);
  }
};

export const getAllProperties = async (req, res) => {
  //Auth middleware
  try {
    const sellerId = req.user;
    const properties = await Property.find({ seller: sellerId });
    res
      .status(200)
      .json({ message: "All Properties fetched successfully", properties });
  } catch (error) {
    res.status(500).json({ message: "Got Error in Get All Properties " });
    console.error(error);
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }
    res
      .status(200)
      .json({ message: "Property fetched successfully", property });
  } catch (error) {}
};

export const renewalPlan = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const planId = req.params.id;
    if (!sellerId || !planId) {
      return res.status(400).json({ message: "Seller and Plan are required." });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Invalid plan selected." });
    }

    const newPlanStartingIn = new Date(Date.now());

    const newPlanExpiryIn = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000
    );

    seller.plan = planId;
    seller.planExpiryDate = newPlanExpiryIn;
    seller.planStartingDate = newPlanStartingIn;
    await seller.save({ validateBeforeSave: false });
    res.status(200).json({ message: "Plan Renewed Successfully", seller });
  } catch (error) {
    console.error("Error in renewalPlan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
