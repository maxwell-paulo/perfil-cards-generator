import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({ sub: user.id });

        const response = NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
            }
        });

        // Configurar cookie seguro com token (24 horas)
        response.cookies.set('auth-token', token, {
            httpOnly: false, // Permitir acesso via JS para funcionalidades do frontend
            secure: process.env.NODE_ENV === 'production', // HTTPS only em produção
            sameSite: 'strict', // Proteção CSRF mais rígida
            maxAge: 24 * 60 * 60, // 24 horas em segundos
            path: '/', // Disponível em toda a aplicação
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined // Domain específico em produção
        });

        return response;
    } catch (error) {
        console.error('[LOGIN_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 