"use client";

import { useState, useEffect } from "react";
import { isAuthenticated, removeAuthToken } from "@/lib/cookies";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Verificar autenticação inicial
        setIsAuth(isAuthenticated());

        // Verificar periodicamente se o status mudou (a cada 5 segundos)
        // Com tokens de 24h, não precisamos verificar tão frequentemente
        const interval = setInterval(() => {
            setIsAuth(isAuthenticated());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        try {
            // Fazer logout no servidor
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            // Limpar cookies localmente
            removeAuthToken();
            setIsAuth(false);
            setLoading(false);

            // Redirecionar para home após logout
            window.location.href = "/";
        }
    };

    if (!isAuth) {
        return null; // Não mostrar o botão se não estiver autenticado
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center justify-center size-10 rounded-full transition-colors duration-300 ease-in-out bg-primary hover:opacity-80 disabled:opacity-50"
            title="Fazer Logout"
        >
            <LogOut className="text-white size-4" />
        </button>
    );
} 