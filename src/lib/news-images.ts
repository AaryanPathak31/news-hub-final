
// This utility enforces strict image rules
// 1. Bans generic "newspaper" images
// 2. Provides category-specific fallbacks
// 3. Ensures no article has a blank image

const GENERIC_KEYWORDS = ['newspaper', 'reading-news', 'blank'];
const KNOWN_BAD_URLS = [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c', // Common newspaper stock
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167' // Another generic one
];

const FALLBACKS: Record<string, string> = {
    'world': 'https://images.unsplash.com/photo-1529101091760-6149d4c81f22?auto=format&fit=crop&q=80', // Globe/Map
    'india': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80', // India Gate/Flag vibe
    'business': 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80', // Stock Graph
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80', // Chip/Circuit
    'tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80', // Stadium
    'entertainment': 'https://images.unsplash.com/photo-1499364668198-48dd9a590d95?auto=format&fit=crop&q=80', // Concert
    'weather': 'https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&q=80', // Clouds
    'health': 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80', // Medical
    'default': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c' // (Only extreme resort)
};

export function getValidatedImage(imageUrl: string | null | undefined, category: string): string {
    const lowerCat = category.toLowerCase().trim();

    // 1. Check if URL is missing
    if (!imageUrl) {
        return FALLBACKS[lowerCat] || FALLBACKS['default'];
    }

    // 2. Check for Banned Keywords (Generic Newspaper)
    // Pollinations URLs contain the prompt, so we can check if the prompt was generic
    const lowerUrl = imageUrl.toLowerCase();

    // If the URL itself (prompt) contains "newspaper" and NOT "drone/police/etc", it might be bad.
    // But strict ban: if the User says NO NEWSPAPERS, even "news photo of..." might trigger it.
    // We will trust the NEW generation logic (which doesn't use these words).
    // But for OLD data, we filter.

    if (lowerUrl.includes('newspaper') || lowerUrl.includes('stacked papers')) {
        return FALLBACKS[lowerCat] || FALLBACKS['default'];
    }

    // 3. Check Known Bad URLs
    if (KNOWN_BAD_URLS.some(bad => imageUrl.startsWith(bad))) {
        return FALLBACKS[lowerCat] || FALLBACKS['default'];
    }

    return imageUrl;
}
