import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import prisma from '../../lib/prisma';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
}

/**
 * Middleware de autenticação opcional
 * Retorna dados do usuário se autenticado, null se não autenticado
 */
export async function getOptionalAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('auth-token')?.value;

        if (!token) {
            return null;
        }

        const decoded = verifyToken<{ sub: string }>(token);

        if (!decoded || !decoded.sub) {
            return null;
        }

        // Busca as informações atualizadas do usuário no banco
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: { id: true, email: true, name: true }
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name || undefined
        };
    } catch {
        return null;
    }
}

/**
 * Versão síncrona que só valida o token (sem buscar dados do usuário)
 * Útil quando só precisamos saber se o usuário está autenticado
 */
export function getOptionalAuthSync(request: NextRequest): { id: string } | null {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('auth-token')?.value;

        if (!token) {
            return null;
        }

        const decoded = verifyToken<{ sub: string }>(token);

        if (!decoded || !decoded.sub) {
            return null;
        }

        return { id: decoded.sub };
    } catch {
        return null;
    }
}

/**
 * Middleware de autenticação obrigatória
 * Lança erro se não autenticado
 */
export async function getRequiredAuth(request: NextRequest): Promise<AuthUser> {
    const user = await getOptionalAuth(request);

    if (!user) {
        throw new Error('Autenticação obrigatória');
    }

    return user;
} 