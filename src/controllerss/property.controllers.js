import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import Ffmpeg from "fluent-ffmpeg";
import { Property } from "../models/Property.js";
import {Seller} from "../models/Seller.js"

export const addProperty = async (req, res) => {
  //auth middleware
  try {
    const { title, description, location, area, price } = req.body;
    const sellerId = req.user._id;



    if (!title || !location || !price || !area) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }
    if(!sellerId ) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const seller = await Seller.findById(sellerId).populate("plan")
    if(!seller){
      return res.status(404).json({message: "Seller not found."})
    }

    if(seller.planExpiryDate <= Date.now()) {
      return res.status(403).json({ message: "Your plan expired. Please renew your plan." });
    }

    const propertyCount = await Property.countDocuments({
      seller: sellerId,
      createdAt: {$gte: seller.planStartingDate, $lte: seller.planExpiryDate},
    })

    if(propertyCount >= seller.plan.propertyLimit){
      return res.status(403).json({message: "You have reached the property limit of your plan."})
    }

    if (!req.files || !req.files.images || !req.files.videos) {
      return res
        .status(400)
        .json({ message: "Images and videos are required" });
    }

    const imageUploads = [];
    for (const file of req.files.images) {
      if (file.size > 2 * 1024 * 1024) {
        fs.unlinkSync(file.path);
        return res
          .status(400)
          .json({ message: "Image size should be less than 2MB" });
      }
      const result = await cloudinary.uploader.upload(file.path);
      imageUploads.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    const videoUploads = [];
    for (const file of req.files.videos) {
      const duration = await getVideoDuration(file.path);
      if (duration > 30) {
        fs.unlinkSync(file.path);
        return res
          .status(400)
          .json({ message: "Video duration should be less than 30 seconds" });
      }
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "video",
      });
      videoUploads.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    const property = new Property({
      seller: sellerId,
      title,
      description,
      location,
      price,
      area,
      images: imageUploads,
      videos: videoUploads,
    });
    await property.save();
    res.status(201).json({ message: "Property added successfully", property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
};
