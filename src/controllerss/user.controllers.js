import { Property } from "../models/Property.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

import twilio from "twilio";
import dotenv from "dotenv";
import { Views } from "../models/Views.js";
import { Bookmark } from "../models/Bookmark.js";
import { Favorite } from "../models/Favorite.js";

dotenv.config();

// Twilio Setup
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
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
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, phone, password: hashPassword });
    await newUser.save();

    const user = await User.findById(newUser.id).select("-password");
    if (!user) {
      return res.status(500).json({ message: "Can't create user" });
    }

    return res
      .status(200)
      .json({ message: "User  created successfully", user });
  } catch (error) {
    console.error("Can't register user: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ phone });
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

    const loggedinUser = await User.findById(user._id).select("-password");
    // const accessToken = token

    res.status(200).cookie("accessToken", token).json({
      message: "user loggedin successfully",
      loggedinUser,
      accessToken: token,
    });
  } catch (error) {
    console.error("Can't login user: ", error);
    res.status(500).json({
      message: "server error",
    });
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

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {}
};

export const getPropertyByIdForUser = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user._id; // Assuming user ID is extracted from auth middleware

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    const viewRecord = await Views.findOne({ propertyId });
    if (viewRecord) {
      if (viewRecord.viewersId.includes(userId)) {
        const avgRating = await property.getAverageRating();
        return res.status(200).json({
          property: { ...property.toObject(), averageRating: avgRating },
        });
      }

      viewRecord.viewersId.push(userId);
      await viewRecord.save();
    } else {
      const newViewrecord = new Views({
        propertyId,
        viewersId: [userId],
      });
      await newViewrecord.save();
    }
    property.views += 1;
    await property.save();

    res
      .status(200)
      .json({ message: "Property fetched successfully", property });
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
      return res
        .status(400)
        .json({ message: "Invalid rating. Must be between 1 and 5." });
    }

    // Check if the property exists
    const propertyExists = await Property.findById(propertyId);
    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found." });
    }

    // Check if any review exists for this property
    const reviewExistsForProperty = await Review.findOne({
      propertyId: propertyId,
    });

    if (reviewExistsForProperty) {
      // If property has reviews, check if the user already reviewed it
      const existingReview = await Review.findOne({
        propertyId: propertyId,
        userId,
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this property." });
      }
    }

    // Create a new review
    const newReview = new Review({
      userId,
      propertyId,
      stars,
    });

    await newReview.save();

    res
      .status(201)
      .json({ message: "Review submitted successfully!", review: newReview });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this review." });
    }
    await review.remove();
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getApprovedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: "approved" });
    if (!properties) {
      return res.status(404).json({ message: "No approved properties found." });
    }

    const propertiesWithRating = await Promise.all(
      properties.map(async (property) => {
        const avgRating = await property.getAverageRating();
        return { ...property.toObject(), averageRating: avgRating };
      })
    );
    res.status(200).json({
      message: "Approved properties fetched successfully",
      properties: propertiesWithRating,
    });
  } catch (error) {
    console.error("Error fetching approved properties:", error);
    res.status(500).json({ message: "Error fetching approved properties" });
  }
};

///----------------------------->

// 📌 Send OTP API
export const sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone)
    return res.status(400).json({ message: "Phone number is required" });

  try {
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 mins
    await user.save();

    console.log(`✅ Sending OTP: ${otp} to ${phone}`);

    // Ensure phone number format is correct
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    console.log("formattedPhone", formattedPhone);

    // Send OTP via Twilio
    const message = await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log("📩 Twilio Response:", message);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Twilio Error:", error);
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

// 📌 Verify OTP API
export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP Verified, clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};

// 📌 Reset Password API
export const resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user) return res.status(400).json({ message: "User not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};

export const addBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    let bookmark = await Bookmark.findOne({ userId });

    if (bookmark) {
      if (bookmark.propertyId.includes(propertyId)) {
        return res.status(400).json({
          message: "You have already added this property to your bookmark.",
        });
      }

      bookmark.propertyId.pash(propertyId);
      await bookmark.save();
    } else {
      bookmark = new Bookmark({
        userId,
        propertyId: [propertyId],
      });
      await bookmark.save();
    }

    res
      .status(201)
      .json({ message: "Property added to bookmark successfully!", bookmark });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;
    const bookmark = await Bookmark.findOne({ userId });
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found." });
    }
    if (!bookmark.propertyId.includes(propertyId)) {
      return res
        .status(400)
        .json({ message: "Property not found in your bookmark." });
    }
    bookmark.propertyId = bookmark.propertyId.filter(
      (id) => id.toString() !== propertyId
    );

    if (bookmark.propertyId.length === 0) {
      await Bookmark.deleteOne({ _id: bookmark._id });
    } else {
      await bookmark.save();
    }

    res
      .status(400)
      .json({ message: "Property removed from Bookmark sucessfully !" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmark = await Bookmark.findOne({ userId });
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found." });
    }
    const properties = await Property.find({
      _id: { $in: bookmark.propertyId },
    });
    res
      .status(200)
      .json({
        message: "Fetched bookmarked properties successfully",
        properties,
      });
  } catch (error) {
    console.error("Error fetching bookmarked properties:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }
    let favorite = await Favorite.findOne({ userId });
    if (favorite) {
      if (favorite.propertyId.includes(propertyId)) {
        return res
          .status(400)
          .json({
            message: "You have already added this property to your favorite.",
          });
      }
      favorite.propertyId.push(propertyId);
    } else {
      favorite = new Favorite({
        userId,
        propertyId: [propertyId],
      });
      await favorite.save();

      res
        .status(201)
        .json({
          message: "Property added to favorite successfully!",
          favorite,
        });
    }
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const propertyId = req.params.id;
    const favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found." });
    }
    if (!favorite.propertyId.includes(propertyId)) {
      return res
       .status(400)
       .json({ message: "Property not found in your favorite." });
    }
    favorite.propertyId = favorite.propertyId.filter(
      (id) => id.toString()!== propertyId
    );
    if (favorite.propertyId.length === 0) {
      await Favorite.deleteOne({ _id: favorite._id });
    } else {
      await favorite.save();
    }
    res.status(400).json({message: "successfully removed from favorite list", })
  }
  catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found." });
    }
    const properties = await Property.find({
      _id: { $in: favorite.propertyId },
    });
    res
     .status(200)
     .json({
        message: "Fetched favorite properties successfully",
        properties,
      });
  } catch (error) {
    console.error("Error fetching favorite properties:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
