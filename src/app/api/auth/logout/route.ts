import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });

        // Limpar o cookie de autenticação com configurações de segurança
        response.cookies.set('auth-token', '', {
            httpOnly: false, // Manter consistência com as outras rotas
            secure: process.env.NODE_ENV === 'production', // HTTPS only em produção
            sameSite: 'strict', // Proteção CSRF mais rígida
            maxAge: 0, // Expira imediatamente
            path: '/', // Mesmo path usado para criar o cookie
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined // Domain específico em produção
        });

        return response;
    } catch (error) {
        console.error('[LOGOUT_ERROR]', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 