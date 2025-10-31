import type { Request, Response, NextFunction } from 'express';
import type { User } from '../../models/user';
import { AppError } from '../../utils/app-error';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import jwt, { type Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export class AuthController {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw new AppError('Email and password are required', 400);

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) throw new AppError('User already exists', 409);

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser: User = await prisma.user.create({
                data: { email, password: hashedPassword },
            });

            delete (newUser as any).password;
            res.status(201).json({ success: true, data: newUser });
        } catch (err) {
            next(err);
        }
    }

    async signin(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw new AppError('Email and password are required', 400);

            const user = await prisma.user.findUnique({ where: { email } });

            if (!user || !user.password) {
                return res.status(400).json({ success: false, error: { message: 'Invalid email or password' } });
            }

            const passwordMatches = await bcrypt.compare(password, user.password);

            if (!passwordMatches) {
                return res.status(400).json({ success: false, error: { message: 'Invalid email or password' } });
            }

            const { password: _pwd, ...userWithoutPassword } = user;

            const token = jwt.sign(
                { id: user.id, email: user.email }, 
                JWT_SECRET!,
                { expiresIn: JWT_EXPIRES_IN! }
            );
            
            res.cookie('session', token, {
                httpOnly: true,
                secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
                path: '/',
            });

            return res.json({ success: true, data: userWithoutPassword });
        } catch (err) {
            next(err);
        }
    }

    async signout(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('session', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 0,
                path: '/',
            });

            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user) {
                return res.status(404).json({ success: false, error: { message: 'User not found' } });
            }

            const { password, ...userWithoutPassword } = user;

            return res.json({ success: true, data: userWithoutPassword });
        } catch (err) {
            next(err);
        }
    }
}
