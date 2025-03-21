const Seller = require("../models/Seller");

// @desc    Seller Verification Request
// @route   POST /api/sellers/verify
// @access  Private (Only logged-in users)
exports.verifySeller = async (req, res) => {
  try {
    const { aadhaarProof, locationProof } = req.body;
    const userId = req.user._id;

    if (!aadhaarProof || !locationProof) {
      return res.status(400).json({ message: "Aadhaar proof and location proof are required" });
    }

    // Check if seller already exists
    let seller = await Seller.findById(userId );
    if (seller) {
      return res.status(400).json({ message: "Seller verification already requested" });
    }

    // Create new seller entry
    seller = new Seller({ userId, aadhaarProof, locationProof, status: "pending" });
    await seller.save();

    res.status(201).json({ message: "Verification request submitted", seller });
  } catch (error) {
    console.error("❌ Error verifying seller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Admin Approve/Reject Seller
// @route   PUT /api/admin/sellers/:sellerId/approve
// @access  Private (Admin only)
exports.approveSeller = async (req, res) => {
  try {
    const { status } = req.body;
    const { sellerId } = req.params;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find seller by ID
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Update status
    seller.status = status;
    await seller.save();

    res.status(200).json({ message: `Seller ${status} successfully`, seller });
  } catch (error) {
    console.error("❌ Error approving/rejecting seller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
