import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export function createJWT(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
