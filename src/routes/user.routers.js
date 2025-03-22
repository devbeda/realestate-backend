import Router from "express"
<<<<<<< HEAD
import { getUser, loginUser, logoutUser, registerUser, resetPassword, sendOtp, verifyOtp } from "../controllerss/user.controllers.js";
=======
import { createReview, deleteReview, getPropertyByIdForUser, getUser, loginUser, logoutUser, registerUser } from "../controllerss/user.controllers.js";
>>>>>>> upstream/main
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post('/createuser', registerUser)
router.post('/loginuser', loginUser)
router.post('/logoutuser', logoutUser)
router.get('/getuser', authMiddleware , getUser)
<<<<<<< HEAD
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)
=======
router.get('/getproperty/:id',authMiddleware, getPropertyByIdForUser)
router.post('/createreview/:id', authMiddleware, createReview)
router.delete('/deleteReview/:id', authMiddleware, deleteReview)
>>>>>>> upstream/main


export default router