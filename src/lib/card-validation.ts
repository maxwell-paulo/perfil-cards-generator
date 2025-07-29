import prisma from '../../lib/prisma';
import { normalizeText } from './utils';

/**
 * Verifica se já existe uma carta com a mesma resposta (ignorando acentos e case)
 */
export async function findExistingCardByAnswer(secretItem: string, category: string) {
    // Normaliza o texto de busca
    const normalizedSecretItem = normalizeText(secretItem);

    // Busca todas as cartas da mesma categoria
    const cards = await prisma.card.findMany({
        where: {
            category: category.toLowerCase()
        },
        select: {
            id: true,
            secret_item: true,
            tips: true,
            difficulty: true,
            category: true,
            created_at: true,
            creator_id: true
        }
    });

    // Verifica se alguma carta tem a mesma resposta (normalizada)
    for (const card of cards) {
        if (normalizeText(card.secret_item) === normalizedSecretItem) {
            return card;
        }
    }

    return null;
}

/**
 * Verifica se já existe uma carta com a mesma categoria e dificuldade
 * que NÃO foi criada pelo usuário atual
 */
export async function findExistingCardByCategoryAndDifficulty(
    category: string,
    difficulty: string,
    excludeUserId?: string
) {
    const whereClause: {
        category: string;
        difficulty: string;
        is_public: boolean;
        creator_id?: { not: string };
    } = {
        category: category.toLowerCase(),
        difficulty: difficulty.toLowerCase(),
        is_public: true
    };

    // Se há um usuário logado, excluir cartas criadas por ele
    if (excludeUserId) {
        whereClause.creator_id = {
            not: excludeUserId
        };
    }

    const existingCard = await prisma.card.findFirst({
        where: whereClause,
        select: {
            id: true,
            secret_item: true,
            tips: true,
            difficulty: true,
            category: true,
            created_at: true,
            creator_id: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return existingCard;
}

/**
 * Salva uma nova carta no banco de dados
 */
export async function saveCard(cardData: {
    category: string;
    secret_item: string;
    tips: string[];
    difficulty: string;
    creator_id?: string;
}) {
    const newCard = await prisma.card.create({
        data: {
            category: cardData.category.toLowerCase(),
            secret_item: cardData.secret_item,
            tips: cardData.tips,
            difficulty: cardData.difficulty.toLowerCase(),
            creator_id: cardData.creator_id || null,
            is_public: true
        },
        select: {
            id: true,
            secret_item: true,
            tips: true,
            difficulty: true,
            category: true,
            created_at: true,
            creator_id: true
        }
    });

    return newCard;
} 