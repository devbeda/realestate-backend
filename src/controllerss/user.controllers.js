import { Property } from "../models/Property.js";
import { Review } from "../models/Review.js";
import {User} from "../models/User.js";
import bcrypt from "bcryptjs";


const generateAccessToken = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    const accessToken = user.generateAccessToken();

    await user.save({ validateBeforeSave: false });

    return accessToken;
  } catch (error) {
    return error.message;
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email, phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser =  new User({ name, email, phone, password: hashPassword });
    await newUser.save()

    const user = await User.findById(newUser.id).select("-password")
    if (!user) {
      return res.status(500).json({ message: "Can't create user" });
    }

    return res.status(200).json({ message: "User  created successfully", user })
    // const newUser = await User.save({name, email, password
  } catch (error) {
    console.error("Can't register user: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User Can't Find" });
    }
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT token
    const token = await generateAccessToken(user._id);
    if (!token) {
      return res.status(500).json({ message: "can't generate accessToken" });
    }

    const loggedinUser = await User.findById(user._id).select("-password")
    // const accessToken = token

    res
      .status(200)
      .cookie("accessToken", token)
      .json({
        message: "user loggedin successfully",
        loggedinUser,
        accessToken:token
      });
  } catch (error) {
    console.error("Can't login user: ", error);
    res.status(500).json({
        message: "server error"
    })
  }
};

export const logoutUser = async (req, res) => {
    try {
      res.clearCookie("accesssToken");
      res.json({ message: "User logged out successfully" });
    } catch (error) {
      console.error("Can't logout user: ", error);
      res.status(500).json({ message: "server error" });
    }
};

export const getUser = async(req,res) => {
    try {
      const user = await User.findById(req.user._id).select("-password")
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({message: "User fetched successfully", user})
    } catch (error) {
      
    }

}

export const getPropertyByIdForUser = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user._id; // Assuming user ID is extracted from auth middleware

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // Check if the property already exists in the Views collection
    let existingView = await Views.findOne({ propertyId });

    if (!existingView) {
      // If the property is not in the Views collection, create a new record
      existingView = await Views.create({ propertyId, viewersId: [userId] });
    } else {
      // If the property exists, check if the user has already viewed it
      if (!existingView.viewersId.includes(userId)) {
        existingView.viewersId.push(userId); // Add user if they haven't viewed it before
        await existingView.save();
      }
    }

    res.status(200).json({ message: "Property fetched successfully", property });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Error fetching property" });
  }
};

export const createReview = async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from authentication middleware
    const propertyId = req.params.id;
    const { stars } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Invalid rating. Must be between 1 and 5." });
    }

    // Check if the property exists
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found." });
    }

    // Check if any review exists for this property
    const reviewExistsForProperty = await Review.findOne({ properId: propertyId });

    if (reviewExistsForProperty) {
      // If property has reviews, check if the user already reviewed it
      const existingReview = await Review.findOne({ properId: propertyId, userId });

      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this property." });
      }
    }

    // Create a new review
    const newReview = new Review({
      userId,
      properId: propertyId,
      stars,
    });

    await newReview.save();

    res.status(201).json({ message: "Review submitted successfully!", review: newReview });

  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





