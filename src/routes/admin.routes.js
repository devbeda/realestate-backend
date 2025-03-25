import Router from "express"
import { approveProperty, getAllProperty, getAllSeller, getPropertyById, getSellerProfile, removeSeller, sellerApprove } from "../controllerss/admin.controllers.js"

const router = Router()

router.post('/approveseller/:id', sellerApprove)
router.post('/approveproperty/:id', approveProperty)
router.get('/getallsellers', getAllSeller)
router.get('/getseller/:id', getSellerProfile)
router.delete('/removeseller/:id', removeSeller)

router.get('/getallproperties/:id', getAllProperty)
router.get('/getproperty/:id', getPropertyById)

export default router