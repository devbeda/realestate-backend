import Router from  "express"
import { createPlan, deletePlan, getPlans, updatePlan } from "../controllerss/plan.controllers.js"

const router = Router()

router.post('/addplan', createPlan) 
router.get('/getplan', getPlans )
router.put('/updateplan/:id', updatePlan)
router.delete('/deleteplan/:id', deletePlan)

export default router;