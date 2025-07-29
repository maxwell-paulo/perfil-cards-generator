"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="bg-app text-app min-h-screen flex flex-col items-center justify-center p-8 pt-16" >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-title text-4xl font-bold">Perfil Generator</h1>
          <p className="text-subtitle text-lg">Gerador de cartas para o jogo Perfil usando IA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de exemplo */}
          <div className="bg-card border border-card rounded-lg p-6 space-y-4">
            <h2 className="text-title text-2xl font-semibold">Como funciona</h2>
            <p className="text-app">Gere cartas do jogo Perfil de duas formas: informando a resposta + categoria ou apenas categoria + dificuldade.</p>
            <ul className="text-app space-y-2">
              <li>• <strong>Modo 1:</strong> Categoria + Resposta específica</li>
              <li>• <strong>Modo 2:</strong> Categoria + Dificuldade (requer login)</li>
            </ul>
          </div>

          {/* Card com API */}
          <div className="bg-card border border-card rounded-lg p-6 space-y-4">
            <h2 className="text-title text-2xl font-semibold">API de Cartas</h2>
            <p className="text-subtitle">Teste a geração de cartas usando nossa API.</p>
            <div className="flex gap-3">
              <Link href="/test-api">
                <button className="bg-accent text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Testar API
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-highlight text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Fazer Login
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card rounded-lg p-6">
          <h2 className="text-title text-xl font-semibold mb-4">Recursos Implementados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-accent font-medium mb-2">✅ Sistema de Autenticação</h3>
              <ul className="text-app text-sm space-y-1">
                <li>• Login e registro de usuários</li>
                <li>• JWT tokens</li>
                <li>• Middleware de autenticação opcional</li>
              </ul>
            </div>
            <div>
              <h3 className="text-accent font-medium mb-2">✅ Geração de Cartas</h3>
              <ul className="text-app text-sm space-y-1">
                <li>• Integração com Gemini AI</li>
                <li>• Validação de duplicatas</li>
                <li>• Normalização de texto (acentos, case)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-accent font-medium mb-2">✅ Interface</h3>
              <ul className="text-app text-sm space-y-1">
                <li>• Tema claro/escuro</li>
                <li>• Design responsivo</li>
                <li>• Classes CSS personalizadas</li>
              </ul>
            </div>
            <div>
              <h3 className="text-accent font-medium mb-2">✅ Banco de Dados</h3>
              <ul className="text-app text-sm space-y-1">
                <li>• PostgreSQL com Prisma</li>
                <li>• Relacionamentos User/Card</li>
                <li>• Sistema de cartas salvas</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-subtitle">
            Use o switcher no topo direito para alternar entre tema claro e escuro
          </p>
        </div>
      </div>
    </main>
  );
}