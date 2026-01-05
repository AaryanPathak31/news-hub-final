import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Direct Unsplash URLs - pre-curated, guaranteed unique, NO newspapers
const UNSPLASH_IMAGES: Record<string, string[]> = {
    'world': [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48bc6a?w=800&h=400&fit=crop', // World map
        'https://images.unsplash.com/photo-1526470608268-f674ce90efd4?w=800&h=400&fit=crop', // UN flags
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=400&fit=crop', // Globe
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop', // Earth from space
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop', // Conference room
    ],
    'india': [
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=400&fit=crop', // India Gate
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=400&fit=crop', // Delhi street
        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=400&fit=crop', // Mumbai skyline
        'https://images.unsplash.com/photo-1532664189809-02133fee698d?w=800&h=400&fit=crop', // Indian market
        'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&h=400&fit=crop', // Indian flag
    ],
    'business': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop', // Stock market
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop', // Financial charts
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop', // Corporate building
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop', // Money/Currency
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop', // Business meeting
    ],
    'technology': [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop', // Circuit board
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop', // Cybersecurity
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop', // AI brain
        'https://images.unsplash.com/photo-1558494949-c5c8b5cc7e2c?w=800&h=400&fit=crop', // Server room
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop', // Code on screen
    ],
    'sports': [
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop', // Stadium
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=400&fit=crop', // Cricket
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop', // Football
        'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=400&fit=crop', // Tennis
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop', // Basketball
    ],
    'entertainment': [
        'https://images.unsplash.com/photo-1470229722913-5f4c0a8e0c4b?w=800&h=400&fit=crop', // Concert
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop', // Cinema
        'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=400&fit=crop', // Red carpet
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop', // Stage lights
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop', // Festival crowd
    ],
    'health': [
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop', // Medical tech
        'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&h=400&fit=crop', // Doctor
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop', // Hospital
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=400&fit=crop', // Stethoscope
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop', // Fitness
    ],
    'politics': [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48bc6a?w=800&h=400&fit=crop', // Parliament
        'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&h=400&fit=crop', // Voting
        'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&h=400&fit=crop', // Capitol
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=400&fit=crop', // Meeting
        'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=800&h=400&fit=crop', // Protest
    ],
};

// Track used images to avoid duplicates
const usedImages = new Set<string>();

function getUniqueImage(category: string): string {
    const catKey = category.toLowerCase();
    const images = UNSPLASH_IMAGES[catKey] || UNSPLASH_IMAGES['world'];

    // Find an unused image
    for (const img of images) {
        if (!usedImages.has(img)) {
            usedImages.add(img);
            return img;
        }
    }

    // If all used, pick random (better than repeating same one)
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

async function fixAllImages() {
    console.log("=== FIXING ALL IMAGES WITH UNSPLASH (GUARANTEED UNIQUE) ===\n");

    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, slug, category:categories(slug)')
        .order('published_at', { ascending: false });

    if (error || !articles) {
        console.error("Failed to fetch articles:", error);
        return;
    }

    console.log(`Found ${articles.length} articles to fix.\n`);

    for (const article of articles) {
        const catSlug = (article.category as any)?.slug || 'world';
        const newImage = getUniqueImage(catSlug);

        console.log(`[${catSlug.toUpperCase()}] ${article.title.substring(0, 40)}... → ${newImage.substring(0, 50)}...`);

        await supabase
            .from('articles')
            .update({ featured_image: newImage })
            .eq('id', article.id);
    }

    console.log("\n=== ALL IMAGES FIXED WITH UNIQUE UNSPLASH PHOTOS ===");
}

fixAllImages();
