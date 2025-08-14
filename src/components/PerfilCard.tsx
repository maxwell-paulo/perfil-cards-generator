"use client";

import React from "react";

type Orientation = "portrait" | "landscape";

export interface PerfilCardProps {
    category: string;
    secretItem: string;
    tips: string[];
    difficulty: string;
    orientation?: Orientation;
    /** Optional visual scale factor to preview bigger/smaller on screen */
    scale?: number;
    className?: string;
}

/**
 * Visualização no estilo das cartas do jogo Perfil.
 * Mantém proporção 8.7cm × 5.7cm. Por padrão usa orientação "portrait"
 * (altura maior), que é a forma mais comum de leitura das dicas.
 */
export default function PerfilCard({
    category,
    secretItem,
    tips,
    difficulty,
    orientation = "portrait",
    scale = 1,
    className,
}: PerfilCardProps) {
    // 1cm em pixels: 96 / 2.54
    const CM_TO_PX = 37.7952755906;
    const widthCm = 8.7;
    const heightCm = 5.7;

    const baseWidth = widthCm * CM_TO_PX;
    const baseHeight = heightCm * CM_TO_PX;

    const width = orientation === "landscape" ? baseWidth : baseHeight;
    const height = orientation === "landscape" ? baseHeight : baseWidth;

    return (
        <div
            className={[
                "relative rounded-xl border border-border shadow-sm bg-white text-gray-800 dark:bg-white",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            style={{
                width: `${width * scale}px`,
                height: `${height * scale}px`,
            }}
        >
            {/* Faixa superior com categoria e dificuldade */}
            <div className="flex items-center justify-between px-3 py-2 rounded-t-xl"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(229,231,235,1) 0%, rgba(243,244,246,1) 100%)",
                }}
            >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                    {category}
                </div>
                <div className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-800 text-white">
                    {difficulty}
                </div>
            </div>

            {/* Cabeçalho instrução + resposta (opcionalmente visível) */}
            <div className="px-3 pt-2 pb-1">
                <div className="text-[10px] text-gray-600">
                    Diga aos jogadores que sou uma
                    <span className="font-semibold ml-1">{category}</span>
                </div>
                <div className="text-[11px] font-bold text-gray-800 truncate" title={secretItem}>
                    {secretItem}
                </div>
            </div>

            {/* Lista de dicas */}
            <div className="px-3 pb-3 overflow-hidden h-[calc(100%-70px)]">
                <ol className="list-decimal pl-5 pr-1 text-[10px] leading-tight space-y-0.5 h-full overflow-y-auto">
                    {tips.map((tip, index) => (
                        <li key={index} className="text-gray-800">
                            {tip}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}



