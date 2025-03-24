import Router from "express"
import { getUser, loginUser, logoutUser, registerUser, resetPassword, sendOtp, verifyOtp, createReview, deleteReview, getPropertyByIdForUser, getApprovedProperties } from "../controllerss/user.controllers.js";
// import {  getUser, loginUser, logoutUser, registerUser } from "../controllerss/user.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post('/createuser', registerUser)
router.post('/loginuser', loginUser)
router.post('/logoutuser', logoutUser)
router.get('/getuser', authMiddleware , getUser)
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)
router.get('/getallpropertiesforuser', getApprovedProperties)
router.get('/getproperty/:id',authMiddleware, getPropertyByIdForUser)
router.post('/createreview/:id', authMiddleware, createReview)
router.delete('/deleteReview/:id', authMiddleware, deleteReview)



export default router