import { Router } from "express";
import type { Request, Response, NextFunction } from 'express';
import { LocationController } from '../controllers/location/locationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/doc', (req:Request, res:Response) => {
    res.json({
        message: 'Location endpoints',
        endpoints: {
            getAllLocations: '/api/locations/ (GET)',
            createLocation: '/api/locations/ (POST)',
        },
    })
})

router.get('/', LocationController.getAllLocations);
router.post('/', LocationController.createLocation);
router.delete('/:id', LocationController.deleteLocation);
router.put('/:id/default', LocationController.setDefaultLocation);
router.put('/:id', LocationController.updateLocation);

export default router;