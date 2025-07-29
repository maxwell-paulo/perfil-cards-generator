"use client";

import { useState } from "react";
import { getAuthToken, isAuthenticated } from "@/lib/cookies";

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

export default function TestApiPage() {
    const [category, setCategory] = useState("pessoa");
    const [secretItem, setSecretItem] = useState("");
    const [difficulty, setDifficulty] = useState("médio");
    const [mode, setMode] = useState<"answer" | "category">("answer");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ApiResponse | null>(null);

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

            // Adicionar token se disponível dos cookies
            const token = getAuthToken();
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

    return (
        <div className="bg-app text-app min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-title text-3xl font-bold">Teste da API de Cartas</h1>
                    <p className="text-subtitle">Teste a geração de cartas do jogo Perfil</p>
                </div>



                <div className="bg-card border border-card rounded-lg p-6">
                    <h2 className="text-title text-xl font-bold mb-4">🎮 Geração de Cartas</h2>

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
                                {!isAuthenticated() && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                            ⚠️ <strong>Aviso:</strong> Este modo requer autenticação.
                                            <a href="/login" className="text-accent hover:underline ml-1">Faça login primeiro</a> para usar esta funcionalidade.
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