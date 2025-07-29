import prisma from '../../lib/prisma';

interface UnusedCard {
    id: string;
    category: string;
    secret_item: string;
    tips: string[];
    difficulty: string | null;
    created_at: Date;
    creator_id: string | null;
}

/**
 * Busca todas as cartas existentes de uma categoria específica
 * Retorna apenas os secret_items para enviar no prompt do Gemini
 */
export async function getExistingCardsByCategory(category: string): Promise<string[]> {
    try {
        const cards = await prisma.card.findMany({
            where: {
                category: category.toLowerCase()
            },
            select: {
                secret_item: true
            }
        });

        // Retorna apenas a lista de secret_items
        return cards.map(card => card.secret_item);
    } catch (error) {
        console.error('Erro ao buscar cartas existentes:', error);
        // Em caso de erro, retornar array vazio para não bloquear a geração
        return [];
    }
}

/**
 * Verifica se um secret_item já existe em uma categoria
 */
export async function checkSecretItemExists(category: string, secretItem: string): Promise<boolean> {
    try {
        const existingCard = await prisma.card.findFirst({
            where: {
                category: category.toLowerCase(),
                secret_item: {
                    equals: secretItem,
                    mode: 'insensitive' // Case insensitive
                }
            }
        });

        return existingCard !== null;
    } catch (error) {
        console.error('Erro ao verificar secret_item:', error);
        return false;
    }
}

/**
 * Busca uma carta existente que o usuário ainda não usou
 * Prioriza reutilização de cartas existentes antes de gerar novas
 */
export async function findUnusedCardForUser(
    userId: string,
    category: string,
    difficulty: string
): Promise<UnusedCard | null> {
    try {
        // Buscar todas as cartas da categoria e dificuldade
        const allCards = await prisma.card.findMany({
            where: {
                category: category.toLowerCase(),
                difficulty: difficulty.toLowerCase()
            },
            select: {
                id: true,
                category: true,
                secret_item: true,
                tips: true,
                difficulty: true,
                created_at: true,
                creator_id: true
            }
        });

        if (allCards.length === 0) {
            return null; // Nenhuma carta existe na categoria/dificuldade
        }

        // Buscar todas as cartas que o usuário já usou
        const usedCards = await prisma.userCards.findMany({
            where: {
                user_id: userId
            },
            select: {
                card_id: true
            }
        });

        const usedCardIds = new Set(usedCards.map((uc: { card_id: string }) => uc.card_id));

        // Encontrar cartas que o usuário ainda não usou
        const unusedCards = allCards.filter(card => !usedCardIds.has(card.id));

        if (unusedCards.length === 0) {
            return null; // Usuário já usou todas as cartas da categoria/dificuldade
        }

        // Retornar uma carta aleatória das não usadas (ou a primeira)
        const randomIndex = Math.floor(Math.random() * unusedCards.length);
        return unusedCards[randomIndex];

    } catch (error) {
        console.error('Erro ao buscar carta não usada:', error);
        return null;
    }
}

/**
 * Conta quantas cartas o usuário ainda não usou em uma categoria/dificuldade
 */
export async function countUnusedCardsForUser(
    userId: string,
    category: string,
    difficulty: string
): Promise<number> {
    try {
        // Buscar todas as cartas da categoria/dificuldade
        const allCards = await prisma.card.findMany({
            where: {
                category: category.toLowerCase(),
                difficulty: difficulty.toLowerCase()
            },
            select: {
                id: true
            }
        });

        if (allCards.length === 0) {
            return 0;
        }

        // Buscar cartas que o usuário já usou
        const usedCards = await prisma.userCards.findMany({
            where: {
                user_id: userId,
                card_id: {
                    in: allCards.map(card => card.id)
                }
            }
        });

        return allCards.length - usedCards.length;

    } catch (error) {
        console.error('Erro ao contar cartas não usadas:', error);
        return 0;
    }
} 