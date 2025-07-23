"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro inesperado");
                return;
            }

            localStorage.setItem("token", data.token);
            router.push("/");
        } catch {
            setError("Erro inesperado");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-sm flex-col gap-4 border p-6 shadow"
            >
                <h1 className="text-center text-2xl font-semibold">Login</h1>
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded border p-2"
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded border p-2"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    type="submit"
                    className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                >
                    Entrar
                </button>
                <p className="text-center text-sm">
                    Não tem conta? <a href="/register" className="underline">Cadastre-se</a>
                </p>
            </form>
        </main>
    );
} 