import { CompareController } from "controllers/compare/compareController";
import { Router } from "express";
import { authMiddleware } from "middleware/authMiddleware";

const router = Router();
router.use(authMiddleware)

router.post('/', (req, res) => {
    CompareController.compareLocations(req, res);
});
router.get('/', (req, res) => {
    CompareController.getComparedLocations(req, res);
});


export default router;