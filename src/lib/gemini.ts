import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface CardGenerationRequest {
    category: string;
    secretItem?: string;
    difficulty?: string;
    existingCards?: string[]; // Lista de secret_items já existentes na categoria
}

export interface GeneratedCard {
    category: string;
    secret_item: string;
    tips: string[];
    difficulty: string;
}

/**
 * Gera uma carta do jogo Perfil usando Gemini AI
 */
export async function generateCard(request: CardGenerationRequest): Promise<GeneratedCard> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt: string;

    if (request.secretItem) {
        // Modo 1: Usuário fornece a resposta e categoria
        const existingCardsText = request.existingCards && request.existingCards.length > 0
            ? `\n\nEXISTING CARDS IN THIS CATEGORY (DO NOT duplicate these):\n${request.existingCards.map(item => `- ${item}`).join('\n')}`
            : '\n\nNo existing cards in this category yet.';

        prompt = `
You are a card generator for the "Perfil" game.

Create a card for category "${request.category}" with the answer being "${request.secretItem}".
${existingCardsText}

Important rules:
1. Generate exactly 20 tips in Portuguese
2. Tips should have RANDOM difficulty - don't make them progressive (tip 15 can be easier than tip 7, for example)
3. Never directly mention the answer name in the tips
4. Tips should be interesting and educational
5. Automatically determine difficulty based on item popularity (fácil, médio, difícil)
6. Include 0 to 2 special tips randomly from these options:
   - "Perca a vez"
   - "Um palpite a qualquer hora" 
   - "Avance X casas" (X = 1, 2, or 3)
   - "Volte X casas" (X = 1, 2, or 3)
   - "Escolha um jogador para voltar X casas" (X = 1, 2, or 3)
7. Special tips are part of the 20 tips, not extra
8. All content should be in Portuguese
9. The secret_item "${request.secretItem}" should be exactly as provided (maintain case and accents)

Respond ONLY in valid JSON format:
{
  "category": "${request.category}",
  "secret_item": "${request.secretItem}",
  "tips": ["tip 1", "tip 2", ..., "tip 20"],
  "difficulty": "fácil|médio|difícil"
}
`;
    } else {
        // Modo 2: Usuário fornece categoria e dificuldade
        const difficulty = request.difficulty || 'médio';
        const existingCardsText = request.existingCards && request.existingCards.length > 0
            ? `\n\nEXISTING CARDS IN THIS CATEGORY (DO NOT choose these secret_items):\n${request.existingCards.map(item => `- ${item}`).join('\n')}\n\nIMPORTANT: Choose a DIFFERENT item that is NOT in the list above!`
            : '\n\nNo existing cards in this category yet.';

        prompt = `
You are a card generator for the "Perfil" game.

Create a card for category "${request.category}" with difficulty "${difficulty}".
${existingCardsText}

Important rules:
1. Choose an appropriate item for the specified category and difficulty
2. For "fácil" difficulty: choose something very well-known and popular
3. For "médio" difficulty: choose something known but not obvious
4. For "difícil" difficulty: choose something less known or more specific
5. CRITICAL: The secret_item you choose MUST NOT be in the existing cards list above
6. Generate exactly 20 tips in Portuguese
7. Tips should have RANDOM difficulty - don't make them progressive
8. Never directly mention the answer name in the tips
9. Include 0 to 2 special tips randomly from these options:
   - "Perca a vez"
   - "Um palpite a qualquer hora"
   - "Avance X casas" (X = 1, 2, or 3)
   - "Volte X casas" (X = 1, 2, or 3) 
   - "Escolha um jogador para voltar X casas" (X = 1, 2, or 3)
10. Special tips are part of the 20 tips, not extra
11. All content should be in Portuguese

Respond ONLY in valid JSON format:
{
  "category": "${request.category}",
  "secret_item": "nome do item escolhido",
  "tips": ["tip 1", "tip 2", ..., "tip 20"],
  "difficulty": "${difficulty}"
}
`;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Remove possíveis marcações de código que o modelo pode adicionar
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const generatedCard = JSON.parse(cleanText) as GeneratedCard;

        // Validação básica da resposta
        if (!generatedCard.category || !generatedCard.secret_item || !generatedCard.tips || !generatedCard.difficulty) {
            throw new Error('Resposta inválida do Gemini');
        }

        if (!Array.isArray(generatedCard.tips) || generatedCard.tips.length !== 20) {
            throw new Error('Número de dicas inválido');
        }

        // Verificação adicional: se temos cartas existentes, garantir que não gerou duplicata
        if (request.existingCards && request.existingCards.length > 0) {
            const isDuplicate = request.existingCards.some(existingItem =>
                existingItem.toLowerCase().trim() === generatedCard.secret_item.toLowerCase().trim()
            );

            if (isDuplicate) {
                throw new Error(`Gemini gerou uma carta duplicata: ${generatedCard.secret_item}. Tentativas adicionais podem ser necessárias.`);
            }
        }

        return generatedCard;
    } catch (error) {
        console.error('Erro ao gerar carta com Gemini:', error);
        throw new Error('Falha ao gerar carta. Tente novamente.');
    }
} 