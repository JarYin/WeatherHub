import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth/authController.ts';

const router = Router();
const authController = new AuthController();

// Index for /api/auth - lists available auth endpoints
router.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Auth endpoints',
        endpoints: {
            signUp: '/api/auth/sign-up (POST)',
            login: '/api/auth/login (POST)',
        },
    });
});

router.post('/sign-up', authController.signup);
router.post('/login', authController.signin);
router.post('/logout', authController.signout);

export default router;