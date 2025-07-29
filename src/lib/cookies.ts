/**
 * Utilitários para gerenciar cookies no frontend
 */

/**
 * Obtém o valor de um cookie pelo nome
 */
export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null; // SSR safe

    const cookies = document.cookie;
    const cookiesArray = cookies.split(';');

    for (const cookie of cookiesArray) {
        const [cookieName, ...cookieValue] = cookie.trim().split('=');

        if (cookieName === name) {
            const value = cookieValue.join('='); // Reconstrói o valor caso tenha = no meio
            return value || null;
        }
    }

    return null;
}

/**
 * Define um cookie
 */
export function setCookie(name: string, value: string, days: number = 7): void {
    if (typeof document === 'undefined') return; // SSR safe

    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Remove um cookie
 */
export function removeCookie(name: string): void {
    if (typeof document === 'undefined') return; // SSR safe

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Obtém o token de autenticação dos cookies
 */
export function getAuthToken(): string | null {
    return getCookie('auth-token');
}

/**
 * Remove o token de autenticação dos cookies
 */
export function removeAuthToken(): void {
    removeCookie('auth-token');
}

/**
 * Verifica se o usuário está autenticado (tem token válido)
 */
export function isAuthenticated(): boolean {
    const token = getAuthToken();
    return token !== null && token.length > 0;
} 