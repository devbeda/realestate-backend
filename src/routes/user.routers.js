import Router from "express"
import { getUser, loginUser, logoutUser, registerUser } from "../controllerss/user.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post('/createuser', registerUser)
router.post('/loginuser', loginUser)
router.post('/logoutuser', logoutUser)
router.get('/getuser', authMiddleware , getUser)

export default router