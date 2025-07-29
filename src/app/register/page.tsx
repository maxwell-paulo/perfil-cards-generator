"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/cookies";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Verificar se usuário já está autenticado
    useEffect(() => {
        if (isAuthenticated()) {
            router.push("/");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro inesperado");
                return;
            }

            // Token é automaticamente salvo nos cookies pelo servidor
            // Redirecionar para a home
            router.push("/");
        } catch {
            setError("Erro ao conectar com o servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-app text-app min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <form
                    onSubmit={handleSubmit}
                    className="bg-card border border-card rounded-lg p-6 space-y-4 shadow-lg"
                >
                    <div className="text-center">
                        <h1 className="text-title text-2xl font-bold mb-2">Criar Conta</h1>
                        <p className="text-subtitle text-sm">Cadastre-se para começar</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-title font-medium block mb-2">Nome:</label>
                            <input
                                type="text"
                                placeholder="Seu nome completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-border rounded-md bg-app text-app"
                            />
                        </div>

                        <div>
                            <label className="text-title font-medium block mb-2">E-mail:</label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 border border-border rounded-md bg-app text-app"
                            />
                        </div>

                        <div>
                            <label className="text-title font-medium block mb-2">Senha:</label>
                            <input
                                type="password"
                                placeholder="Crie uma senha segura"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 border border-border rounded-md bg-app text-app"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-900/20 dark:border-red-800">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-highlight text-white py-3 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Criando conta..." : "Cadastrar"}
                    </button>

                    <div className="text-center">
                        <p className="text-subtitle text-sm">
                            Já tem conta?{" "}
                            <a href="/login" className="text-accent hover:underline font-medium">
                                Fazer login
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
} 