import prisma from '../../lib/prisma';

/**
 * Registra que um usuário utilizou/gerou uma carta
 * Cada usuário só pode usar a mesma carta uma única vez
 */
export async function recordUserCard(userId: string, cardId: string) {
    try {
        // Verificar se o usuário já usou esta carta
        const existingRecord = await prisma.userCards.findUnique({
            where: {
                user_id_card_id: {
                    user_id: userId,
                    card_id: cardId
                }
            }
        });

        // Se já existe, não fazer nada (usuário já usou esta carta)
        if (existingRecord) {
            return existingRecord;
        }

        // Criar novo registro apenas se não existir
        const userCard = await prisma.userCards.create({
            data: {
                user_id: userId,
                card_id: cardId
            }
        });

        return userCard;
    } catch (error) {
        console.error('Erro ao registrar carta do usuário:', error);
        throw new Error('Falha ao registrar uso da carta');
    }
}

/**
 * Busca histórico de cartas utilizadas por um usuário
 */
export async function getUserCardHistory(userId: string, limit = 50) {
    try {
        const userCards = await prisma.userCards.findMany({
            where: {
                user_id: userId
            },
            include: {
                card: {
                    select: {
                        id: true,
                        category: true,
                        secret_item: true,
                        difficulty: true,
                        created_at: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: limit
        });

        return userCards;
    } catch (error) {
        console.error('Erro ao buscar histórico de cartas do usuário:', error);
        throw new Error('Falha ao buscar histórico');
    }
}

/**
 * Verifica se um usuário já utilizou uma carta específica
 * Retorna true se já usou, false caso contrário
 */
export async function hasUserUsedCard(userId: string, cardId: string): Promise<boolean> {
    try {
        const record = await prisma.userCards.findUnique({
            where: {
                user_id_card_id: {
                    user_id: userId,
                    card_id: cardId
                }
            }
        });

        return record !== null;
    } catch (error) {
        console.error('Erro ao verificar uso da carta:', error);
        throw new Error('Falha ao verificar uso da carta');
    }
}

/**
 * Conta quantos usuários diferentes já utilizaram uma carta específica
 */
export async function countCardUsage(cardId: string) {
    try {
        const count = await prisma.userCards.count({
            where: {
                card_id: cardId
            }
        });

        return count;
    } catch (error) {
        console.error('Erro ao contar uso da carta:', error);
        throw new Error('Falha ao contar uso da carta');
    }
} 