import Router from "express"
import { getUser, loginUser, logoutUser, registerUser, resetPassword, sendOtp, verifyOtp, createReview, deleteReview, getPropertyByIdForUser, getApprovedProperties, addBookmark, removeBookmark, getBookmarks, addFavorite, removeFavorite, getFavorites } from "../controllerss/user.controllers.js";
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
// Property
router.get('/getallpropertiesforuser', getApprovedProperties)
router.get('/getproperty/:id',authMiddleware, getPropertyByIdForUser)

// Reviews
router.post('/createreview/:id', authMiddleware, createReview)
router.delete('/deleteReview/:id', authMiddleware, deleteReview)

// Bookmarks
router.post('/addbookmark/:id', authMiddleware, addBookmark)
router.delete('deleteBookmark/:id', authMiddleware, removeBookmark)
router.get('getBookmarks/:id', authMiddleware, getBookmarks)

// Favorites
router.post('/addfavorite/:id', authMiddleware, addFavorite)
router.delete('deletefavorite/:id', authMiddleware, removeFavorite)
router.get('getfavorites/:id', authMiddleware, getFavorites)


export default router