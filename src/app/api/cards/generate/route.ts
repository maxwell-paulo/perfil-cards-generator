import { NextRequest, NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth-middleware';
import { isValidCategory, isValidDifficulty } from '@/lib/utils';
import { generateCard } from '@/lib/gemini';
import {
    findExistingCardByAnswer,
    findExistingCardByCategoryAndDifficulty,
    saveCard
} from '@/lib/card-validation';
import { recordUserCard } from '@/lib/user-cards';
import { getExistingCardsByCategory } from '@/lib/card-lookup';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { category, secretItem, difficulty } = body;

        // Validações básicas
        if (!category || typeof category !== 'string') {
            return NextResponse.json(
                { error: 'Categoria é obrigatória' },
                { status: 400 }
            );
        }

        if (!isValidCategory(category)) {
            return NextResponse.json(
                { error: 'Categoria inválida' },
                { status: 400 }
            );
        }

        // Verificar se usuário está logado
        const user = await getOptionalAuth(request);

        // Modo 1: Usuário fornece resposta + categoria
        if (secretItem) {
            if (typeof secretItem !== 'string' || secretItem.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Resposta da carta é obrigatória' },
                    { status: 400 }
                );
            }

            // Verificar se já existe carta com essa resposta
            const existingCard = await findExistingCardByAnswer(secretItem.trim(), category);

            if (existingCard) {
                // Se usuário está logado, registrar que ele utilizou esta carta
                if (user) {
                    try {
                        await recordUserCard(user.id, existingCard.id);
                    } catch (error) {
                        console.error('Erro ao registrar carta do usuário:', error);
                        // Não falhar a requisição por causa disso, apenas logar o erro
                    }
                }

                return NextResponse.json({
                    success: true,
                    card: existingCard,
                    message: 'Carta já existe no banco de dados',
                    fromDatabase: true
                });
            }

            // Buscar cartas existentes na categoria para evitar duplicatas
            const existingCards = await getExistingCardsByCategory(category.trim());

            // Gerar nova carta com Gemini
            const generatedCard = await generateCard({
                category: category.trim(),
                secretItem: secretItem.trim(),
                existingCards: existingCards
            });

            // Salvar no banco
            const savedCard = await saveCard({
                category: generatedCard.category,
                secret_item: generatedCard.secret_item,
                tips: generatedCard.tips,
                difficulty: generatedCard.difficulty,
                creator_id: user?.id
            });

            // Se usuário está logado, registrar que ele utilizou esta carta
            if (user) {
                try {
                    await recordUserCard(user.id, savedCard.id);
                } catch (error) {
                    console.error('Erro ao registrar carta do usuário:', error);
                    // Não falhar a requisição por causa disso, apenas logar o erro
                }
            }

            return NextResponse.json({
                success: true,
                card: savedCard,
                message: 'Carta gerada com sucesso',
                fromDatabase: false
            });
        }

        // Modo 2: Usuário logado fornece categoria + dificuldade
        else {
            if (!user) {
                return NextResponse.json(
                    { error: 'Para gerar carta por categoria e dificuldade, você precisa estar logado' },
                    { status: 401 }
                );
            }

            if (!difficulty || typeof difficulty !== 'string') {
                return NextResponse.json(
                    { error: 'Dificuldade é obrigatória quando não especificada a resposta' },
                    { status: 400 }
                );
            }

            if (!isValidDifficulty(difficulty)) {
                return NextResponse.json(
                    { error: 'Dificuldade inválida. Use: fácil, médio ou difícil' },
                    { status: 400 }
                );
            }

            // Verificar se já existe carta com essa categoria e dificuldade (excluindo do usuário atual)
            const existingCard = await findExistingCardByCategoryAndDifficulty(
                category,
                difficulty,
                user.id
            );

            if (existingCard) {
                // Registrar que o usuário utilizou esta carta
                try {
                    await recordUserCard(user.id, existingCard.id);
                } catch (error) {
                    console.error('Erro ao registrar carta do usuário:', error);
                    // Não falhar a requisição por causa disso, apenas logar o erro
                }

                return NextResponse.json({
                    success: true,
                    card: existingCard,
                    message: 'Carta já existe no banco de dados',
                    fromDatabase: true
                });
            }

            // Buscar cartas existentes na categoria para evitar duplicatas
            const existingCards = await getExistingCardsByCategory(category.trim());

            // Gerar nova carta com Gemini
            const generatedCard = await generateCard({
                category: category.trim(),
                difficulty: difficulty.trim(),
                existingCards: existingCards
            });

            // Salvar no banco
            const savedCard = await saveCard({
                category: generatedCard.category,
                secret_item: generatedCard.secret_item,
                tips: generatedCard.tips,
                difficulty: generatedCard.difficulty,
                creator_id: user.id
            });

            // Registrar que o usuário utilizou esta carta
            try {
                await recordUserCard(user.id, savedCard.id);
            } catch (error) {
                console.error('Erro ao registrar carta do usuário:', error);
                // Não falhar a requisição por causa disso, apenas logar o erro
            }

            return NextResponse.json({
                success: true,
                card: savedCard,
                message: 'Carta gerada com sucesso',
                fromDatabase: false
            });
        }

    } catch (error) {
        console.error('Erro ao gerar carta:', error);

        const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
} 