import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
}

export function signToken(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken<T = unknown>(token: string): T | null {
    try {
        return jwt.verify(token, JWT_SECRET) as T;
    } catch {
        return null;
    }
} 