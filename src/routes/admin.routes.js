import Router from "express"
import { approveProperty, getAllProperty, getAllSeller, getPropertyById, sellerApprove } from "../controllerss/admin.controllers.js"

const router = Router()

router.post('/approveseller/:id', sellerApprove)
router.post('/approveproperty', approveProperty)
router.get('/gelallsellers', getAllSeller)
router.route('/getallproperty/:id', getAllProperty)
router.route('/getproperty/:id', getPropertyById)

export default router