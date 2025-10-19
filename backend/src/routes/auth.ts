import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth/authController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();
const authController = new AuthController();

router.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Auth endpoints',
        endpoints: {
            signUp: '/api/auth/sign-up (POST)',
            login: '/api/auth/login (POST)',
            logout: '/api/auth/logout (POST)',
            me: '/api/auth/me (GET) - requires auth',
        },
    });
});

router.post('/sign-up', authController.signup);
router.post('/login', authController.signin);
router.post('/logout', authController.signout);

router.get('/me', authMiddleware, authController.getMe);

export default router;