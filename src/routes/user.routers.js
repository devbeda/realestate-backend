import Router from "express"
import { getUser, loginUser, logoutUser, registerUser, resetPassword, sendOtp, verifyOtp } from "../controllerss/user.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post('/createuser', registerUser)
router.post('/loginuser', loginUser)
router.post('/logoutuser', logoutUser)
router.get('/getuser', authMiddleware , getUser)
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)


export default router