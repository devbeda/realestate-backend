const Property = require("../models/Property");

// 🏡 Add New Property
exports.addProperty = async (req, res) => {
  try {
    const { title, description, price, location, images } = req.body;
    const sellerId = req.user.id;

    const property = new Property({ sellerId, title, description, price, location, images });
    await property.save();

    res.status(201).json({ message: "Property listed successfully", property });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🏠 Get Seller's Properties
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ sellerId: req.user.id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✏️ Update Property
exports.updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const updates = req.body;

    const property = await Property.findOneAndUpdate(
      { _id: propertyId, sellerId: req.user.id },
      updates,
      { new: true }
    );

    if (!property) return res.status(404).json({ message: "Property not found" });

    res.json({ message: "Property updated successfully", property });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ❌ Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findOneAndDelete({ _id: propertyId, sellerId: req.user.id });

    if (!property) return res.status(404).json({ message: "Property not found" });

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
