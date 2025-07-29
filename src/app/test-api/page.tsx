"use client";

import { useState, useEffect } from "react";
import { getAuthToken, isAuthenticated, removeAuthToken } from "@/lib/cookies";

interface Card {
    id: string;
    category: string;
    secret_item: string;
    tips: string[];
    difficulty: string;
    created_at: string;
}

interface ApiResponse {
    success: boolean;
    card?: Card;
    message?: string;
    fromDatabase?: boolean;
    error?: string;
}

interface AuthResponse {
    success?: boolean;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
    error?: string;
}

export default function TestApiPage() {
    const [category, setCategory] = useState("pessoa");
    const [secretItem, setSecretItem] = useState("");
    const [difficulty, setDifficulty] = useState("médio");
    const [mode, setMode] = useState<"answer" | "category">("answer");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ApiResponse | null>(null);

    // Estado para autenticação
    const [authToken, setAuthToken] = useState("");
    const [authResult, setAuthResult] = useState<AuthResponse | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

    // Verificar autenticação automática via cookies
    useEffect(() => {
        if (isAuthenticated()) {
            const token = getAuthToken();
            if (token) {
                setAuthToken(token);
                setIsUserAuthenticated(true);
                // Testar automaticamente a autenticação
                testAuthWithToken(token);
            }
        }
    }, []);

    const categories = [
        "pessoa", "lugar", "objeto", "animal", "profissão",
        "filme", "música", "comida", "esporte", "marca",
        "celebridade", "personagem"
    ];

    const difficulties = ["fácil", "médio", "difícil"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const body = mode === "answer"
                ? { category, secretItem }
                : { category, difficulty };

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            // Adicionar token se disponível (manual ou dos cookies)
            const token = authToken.trim() || getAuthToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch("/api/cards/generate", {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });

            const data: ApiResponse = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: "Erro ao conectar com a API"
            });
        } finally {
            setLoading(false);
        }
    };

    const testAuthWithToken = async (token: string) => {
        setAuthLoading(true);
        setAuthResult(null);

        try {
            // Validar token tentando usá-lo em uma operação real
            const response = await fetch("/api/cards/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token.trim()}`
                },
                body: JSON.stringify({
                    category: "teste",
                    difficulty: "médio"
                }),
            });

            if (response.status === 401) {
                // Token inválido
                setAuthResult({
                    success: false,
                    error: "Token inválido ou expirado"
                });
                setIsUserAuthenticated(false);
                removeAuthToken();
                setAuthToken("");
            } else {
                // Token válido (mesmo que a categoria seja inválida, o token foi aceito)
                setAuthResult({
                    success: true,
                    user: {
                        id: "verificado",
                        email: "Token válido"
                    }
                });
                setIsUserAuthenticated(true);
            }
        } catch (error) {
            setAuthResult({
                error: "Erro ao verificar autenticação"
            });
            setIsUserAuthenticated(false);
            removeAuthToken();
            setAuthToken("");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleTestAuth = async () => {
        if (isAuthenticated() || authToken.trim()) {
            const token = authToken.trim() || getAuthToken();
            if (token) {
                await testAuthWithToken(token);
            }
        } else {
            setAuthResult({
                error: "Nenhum token fornecido"
            });
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            // Limpar estado local
            removeAuthToken();
            setAuthToken("");
            setAuthResult(null);
            setIsUserAuthenticated(false);
        }
    };

    return (
        <div className="bg-app text-app min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-title text-3xl font-bold">Teste da API de Cartas</h1>
                    <p className="text-subtitle">Teste a geração de cartas do jogo Perfil</p>
                </div>

                {/* Teste de Autenticação */}
                <div className="bg-card border border-card rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-title text-xl font-bold">🔐 Status de Autenticação</h2>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isUserAuthenticated ? 'bg-highlight text-white' : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                {isUserAuthenticated ? '✅ Autenticado' : '❌ Não Autenticado'}
                            </span>
                        </div>
                    </div>

                    {isUserAuthenticated ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                                <p className="text-green-700 dark:text-green-300">
                                    🎉 <strong>Você está logado!</strong> O token foi carregado automaticamente dos cookies.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleTestAuth}
                                    disabled={authLoading}
                                    className="bg-highlight text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {authLoading ? "Testando..." : "Verificar Autenticação"}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                                >
                                    Fazer Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-title font-medium block mb-2">Token JWT (opcional):</label>
                                <input
                                    type="text"
                                    value={authToken}
                                    onChange={(e) => setAuthToken(e.target.value)}
                                    placeholder="Cole seu token JWT aqui ou faça login automaticamente"
                                    className="w-full p-3 border border-border rounded-md bg-app text-app"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleTestAuth}
                                    disabled={authLoading}
                                    className="bg-highlight text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {authLoading ? "Testando..." : "Testar Autenticação"}
                                </button>
                                <a
                                    href="/login"
                                    target="_blank"
                                    className="bg-accent text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                                >
                                    Ir para Login
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Resultado da autenticação */}
                    {authResult && (
                        <div className="mt-4 p-4 border border-border rounded-lg bg-app">
                            {authResult.success ? (
                                <div className="text-highlight">
                                    <strong>✅ Autenticado com sucesso!</strong>
                                    {authResult.user && (
                                        <div className="mt-2 text-sm">
                                            <p><strong>ID:</strong> {authResult.user.id}</p>
                                            <p><strong>Email:</strong> {authResult.user.email}</p>
                                            {authResult.user.name && <p><strong>Nome:</strong> {authResult.user.name}</p>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-red-600 dark:text-red-400">
                                    <strong>❌ Falha na autenticação:</strong> {authResult.error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-card border border-card rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-title text-xl font-bold">🎮 Geração de Cartas</h2>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isUserAuthenticated ? 'bg-highlight text-white' : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                {isUserAuthenticated ? '🔓 Autenticado' : '🔒 Não Autenticado'}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Modo de geração */}
                        <div>
                            <label className="text-title font-medium block mb-3">Modo de Geração:</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="answer"
                                        checked={mode === "answer"}
                                        onChange={(e) => setMode(e.target.value as "answer")}
                                        className="text-accent"
                                    />
                                    <span>Categoria + Resposta</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="category"
                                        checked={mode === "category"}
                                        onChange={(e) => setMode(e.target.value as "category")}
                                        className="text-accent"
                                    />
                                    <span>Categoria + Dificuldade (requer login)</span>
                                </label>
                            </div>
                        </div>

                        {/* Categoria */}
                        <div>
                            <label className="text-title font-medium block mb-2">Categoria:</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-border rounded-md bg-app text-app"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Resposta (modo answer) */}
                        {mode === "answer" && (
                            <div>
                                <label className="text-title font-medium block mb-2">Resposta da Carta:</label>
                                <input
                                    type="text"
                                    value={secretItem}
                                    onChange={(e) => setSecretItem(e.target.value)}
                                    placeholder="Ex: Pelé, Rio de Janeiro, etc."
                                    className="w-full p-3 border border-border rounded-md bg-app text-app"
                                    required
                                />
                            </div>
                        )}

                        {/* Dificuldade (modo category) */}
                        {mode === "category" && (
                            <div>
                                <label className="text-title font-medium block mb-2">Dificuldade:</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full p-3 border border-border rounded-md bg-app text-app"
                                    required
                                >
                                    {difficulties.map((diff) => (
                                        <option key={diff} value={diff}>
                                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {!isUserAuthenticated && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                            ⚠️ <strong>Aviso:</strong> Este modo requer autenticação.
                                            Faça login primeiro para usar esta funcionalidade.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent text-white py-3 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Gerando carta..." : "Gerar Carta"}
                        </button>
                    </form>
                </div>

                {/* Resultado */}
                {result && (
                    <div className="bg-card border border-card rounded-lg p-6">
                        <h2 className="text-title text-xl font-bold mb-4">Resultado:</h2>

                        {result.success ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.fromDatabase ? 'bg-highlight text-white' : 'bg-accent text-white'
                                        }`}>
                                        {result.fromDatabase ? 'Do Banco de Dados' : 'Gerada com IA'}
                                    </span>
                                    <span className="text-subtitle">{result.message}</span>
                                </div>

                                {result.card && (
                                    <div className="bg-app p-4 rounded-lg border border-border">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <strong className="text-title">Categoria:</strong>
                                                <p className="text-app">{result.card.category}</p>
                                            </div>
                                            <div>
                                                <strong className="text-title">Resposta:</strong>
                                                <p className="text-app">{result.card.secret_item}</p>
                                            </div>
                                            <div>
                                                <strong className="text-title">Dificuldade:</strong>
                                                <p className="text-app">{result.card.difficulty}</p>
                                            </div>
                                            <div>
                                                <strong className="text-title">ID:</strong>
                                                <p className="text-app text-sm">{result.card.id}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <strong className="text-title">Dicas:</strong>
                                            <ol className="list-decimal list-inside mt-2 space-y-1">
                                                {result.card.tips.map((tip, index) => (
                                                    <li key={index} className="text-app">{tip}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
                                <strong className="text-red-600 dark:text-red-400">Erro:</strong>
                                <p className="text-red-600 dark:text-red-400">{result.error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 