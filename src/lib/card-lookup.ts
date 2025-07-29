import prisma from '../../lib/prisma';

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