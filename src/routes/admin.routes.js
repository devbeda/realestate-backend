import Router from "express"
import { approveProperty, getAllProperty, getAllSeller, getPropertyById, sellerApprove } from "../controllerss/admin.controllers.js"

const router = Router()

router.post('/approveseller/:id', sellerApprove)
router.post('/approveproperty/:id', approveProperty)
router.get('/gelallsellers', getAllSeller)
router.get('/getallproperty/:id', getAllProperty)
router.get('/getproperty/:id', getPropertyById)

export default router