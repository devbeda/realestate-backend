import { Seller } from "../models/Seller.js";
import { Property } from "../models/Property.js";

export const sellerApprove = async (req, res) => {
  try {
    const { id } = req.params; // Get seller ID from URL params
    const { status } = req.body; // Get new status from request body

    // Validate status input
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Choose 'approved' or 'rejected'." });
    }

    // Find seller by ID
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Check if seller is already approved or rejected
    if (seller.status === "approved") {
      return res.status(400).json({ message: "Seller is already approved." });
    }
    if (seller.status === "rejected") {
      return res.status(400).json({ message: "Seller is already rejected." });
    }

    // Update seller status
    seller.status = status;
    await seller.save();

    res
      .status(200)
      .json({ message: `Seller status updated to ${status}`, seller });
  } catch (error) {
    console.error("Error updating seller status:", error);
    res.status(500).json({ message: "Error updating seller status." });
  }
};

export const getAllSeller = async (req, res) => {
  try {
    const sellers = await Seller.find({});
    res.status(200).json({message: "all seller are fetched", sellers});
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Error fetching sellers." });
  }
};

export const getSellerProfile = async(req,res) => {
  try {
    const sellerId = req.params.id;
    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required." });
    }
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json({ message: "seller profile fetched successfully", seller });
    } catch (error) {
    console.error("Error fetching seller profile: ", error);
    res.status(500).json({ message: "Interval Server Error" });
    }
}

export const approveProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    } 

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    property.status = status;
    await property.save();
    res
      .status(200)
      .json({ message: `Property status updated to ${status}`, property });
  } catch (error) {
    console.error("Error approving property: ", error);
    res.status(500).json({ message: "Interval Server Error" });
  }
};

export const getAllProperty = async (req, res) => {
  try {
    const sellerId = req.params.id;
    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required." });
    }

    const properties = await Property.find({ seller: sellerId });
    if (!properties.length) {
      return res
        .status(404)
        .json({ message: "No properties found for this seller." });
    }

    res
      .status(200)
      .json({ message: "Seller properties fetched successfully", properties });
  } catch (error) {
    console.error("Error fetching seller properties: ", error);
    res.status(500).json({ message: "Server error" });
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

export const removeSeller = async(req, res) => {
  try {
    const sellerId = req.params.id;
    const seller = await Seller.findByIdAndDelete(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json({ message: "Seller deleted successfully", seller });
  } catch (error) {
    console.error("Error deleting seller: ", error);
    res.status(500).json({ message: "Interval Server Error" });
  }
}
