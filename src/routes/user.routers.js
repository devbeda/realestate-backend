import Router from "express"
import { createReview, deleteReview, getPropertyByIdForUser, getUser, loginUser, logoutUser, registerUser } from "../controllerss/user.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post('/createuser', registerUser)
router.post('/loginuser', loginUser)
router.post('/logoutuser', logoutUser)
router.get('/getuser', authMiddleware , getUser)
router.get('/getproperty/:id',authMiddleware, getPropertyByIdForUser)
router.post('/createreview/:id', authMiddleware, createReview)
router.delete('/deleteReview/:id', authMiddleware, deleteReview)


export default router