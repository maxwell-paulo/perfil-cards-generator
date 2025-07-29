/**
 * Normaliza texto removendo acentos, convertendo para lowercase e removendo espaços extras
 */
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD') // Decomposer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
        .replace(/\s+/g, ' ') // Remove espaços extras
        .trim();
}

/**
 * Compara dois textos ignorando acentos, case e espaços extras
 */
export function isSameText(text1: string, text2: string): boolean {
    return normalizeText(text1) === normalizeText(text2);
}

/**
 * Valida se uma categoria é válida
 */
export function isValidCategory(category: string): boolean {
    const validCategories = [
        'pessoa',
        'lugar',
        'objeto',
        'animal',
        'profissão',
        'filme',
        'música',
        'comida',
        'esporte',
        'marca',
        'celebridade',
        'personagem'
    ];

    return validCategories.includes(category.toLowerCase());
}

/**
 * Valida se um nível de dificuldade é válido
 */
export function isValidDifficulty(difficulty: string): boolean {
    const validDifficulties = ['fácil', 'médio', 'difícil'];
    return validDifficulties.includes(difficulty.toLowerCase());
} 