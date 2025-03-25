import Router from "express";
import {
  getAllProperties,
  getPropertyById,
  getSeller,
  logInSeller,
  logOutSeller,
  registerSeller,
  renewalPlan,
  updateSeller,
} from "../controllerss/seller.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { addProperty } from "../controllerss/property.controllers.js";
import { upload } from "../config/multer.config.js";

const router = Router();

// add routes here
router.post("/registerseller/:id", upload.single("aadhar"), registerSeller);
router.post("/loginseller", logInSeller);
router.get("/getseller", authMiddleware, getSeller);
router.post("/logoutseller", authMiddleware, logOutSeller);
router.post("/updateseller", authMiddleware, updateSeller);

// properties routes
router.post(
  "/addproperty",
  authMiddleware,
  upload.fields([{ name: "images" }, { name: "videos" }]),
  addProperty
);
router.get("/allproperties", authMiddleware, getAllProperties);
router.get("/getproperty/:id", getPropertyById);
router.put("/renewalplan/:id", authMiddleware, renewalPlan);

export default router;
