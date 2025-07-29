"use client";

import { useEffect, useState } from "react";

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
          <p className="text-subtitle text-lg">Testando as novas cores do tema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de exemplo */}
          <div className="bg-card border border-card rounded-lg p-6 space-y-4">
            <h2 className="text-title text-2xl font-semibold">Card de Exemplo</h2>
            <p className="text-app">Este é um exemplo de como as cores ficam em um card.</p>
            <button className="bg-accent text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
              Botão Accent
            </button>
          </div>

          {/* Card com highlight */}
          <div className="bg-card border border-card rounded-lg p-6 space-y-4">
            <h2 className="text-title text-2xl font-semibold">Cores de Destaque</h2>
            <p className="text-subtitle">Exemplo com cores de destaque.</p>
            <div className="flex gap-3">
              <span className="text-accent font-medium">Texto Accent</span>
              <span className="text-highlight font-medium">Texto Highlight</span>
            </div>
            <button className="bg-highlight text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
              Botão Highlight
            </button>
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