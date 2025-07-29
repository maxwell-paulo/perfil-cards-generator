import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        const token = signToken({ sub: user.id });

        const response = NextResponse.json({
            success: true,
            user
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
        console.error('[REGISTER_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 