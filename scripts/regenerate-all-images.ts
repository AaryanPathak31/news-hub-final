import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateAndUploadImage } from './news-automation/generate-images.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

// Category-specific prompt templates - NO NEWSPAPERS ALLOWED
const CATEGORY_PROMPTS: Record<string, (title: string) => string> = {
    'world': (title) => `geopolitical scene, world leaders meeting, diplomatic flags, international conference, ${title}, realistic news photography, 8k --no newspaper`,
    'india': (title) => `modern indian city scene, indian flag, indian infrastructure, ${title}, realistic news photography, 8k --no newspaper --no taj mahal`,
    'business': (title) => `stock market trading floor, financial charts, corporate office, ${title}, realistic news photography, 8k --no newspaper`,
    'technology': (title) => `server room, circuit boards, AI visualization, code on screens, ${title}, realistic news photography, 8k --no newspaper`,
    'sports': (title) => `sports stadium, athletic action, crowd cheering, ${title}, realistic news photography, 8k --no newspaper`,
    'entertainment': (title) => `concert stage, movie premiere, celebrity event, ${title}, realistic news photography, 8k --no newspaper`,
    'health': (title) => `modern hospital, medical research lab, doctors, ${title}, realistic news photography, 8k --no newspaper`,
    'politics': (title) => `parliament building, election rally, political debate, ${title}, realistic news photography, 8k --no newspaper`,
    'default': (title) => `${title}, cinematic news photography, dramatic lighting, 8k --no newspaper --no text`
};

// Generate a smart prompt based on title keywords
function generateSmartPrompt(title: string, categorySlug: string): string {
    const lowerTitle = title.toLowerCase();
    const categoryKey = categorySlug.toLowerCase();

    // Get base prompt from category
    const promptFn = CATEGORY_PROMPTS[categoryKey] || CATEGORY_PROMPTS['default'];
    let prompt = promptFn(title);

    // Enhance based on title keywords
    if (lowerTitle.includes('military') || lowerTitle.includes('army') || lowerTitle.includes('war')) {
        prompt = `military soldiers, tanks, battlefield, geopolitical tension, ${title}, realistic 8k --no newspaper`;
    }
    if (lowerTitle.includes('drone') || lowerTitle.includes('strike') || lowerTitle.includes('attack')) {
        prompt = `military drone in sky, tactical operation, dramatic clouds, ${title}, realistic 8k --no newspaper`;
    }
    if (lowerTitle.includes('bitcoin') || lowerTitle.includes('crypto')) {
        prompt = `cryptocurrency coins, blockchain visualization, digital finance, ${title}, realistic 8k --no newspaper`;
    }
    if (lowerTitle.includes('cricket') || lowerTitle.includes('ipl')) {
        prompt = `cricket stadium, batsman hitting shot, floodlights, crowd cheering, ${title}, realistic 8k --no newspaper`;
    }
    if (lowerTitle.includes('movie') || lowerTitle.includes('film') || lowerTitle.includes('box office')) {
        prompt = `movie premiere, red carpet, film reel, cinema hall, ${title}, realistic 8k --no newspaper`;
    }
    if (lowerTitle.includes('budget') || lowerTitle.includes('economy') || lowerTitle.includes('rbi')) {
        prompt = `indian rupee currency, budget documents, finance ministry, ${title}, realistic 8k --no newspaper`;
    }

    return prompt;
}

async function regenerateAllImages() {
    console.log("=== MASS IMAGE REGENERATION STARTING ===");
    console.log("This will update ALL articles with unique, category-specific images.\n");

    // Fetch all articles with their categories
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, slug, featured_image, category:categories(slug, name)')
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch articles:", error);
        return;
    }

    console.log(`Found ${articles?.length || 0} articles to process.\n`);

    for (const article of articles || []) {
        const categorySlug = (article.category as any)?.slug || 'default';
        const prompt = generateSmartPrompt(article.title, categorySlug);

        console.log(`\n[${categorySlug.toUpperCase()}] ${article.title}`);
        console.log(`   Generating: "${prompt.substring(0, 60)}..."`);

        try {
            const newImageUrl = await generateAndUploadImage(prompt, article.slug);

            if (newImageUrl) {
                await supabase
                    .from('articles')
                    .update({ featured_image: newImageUrl })
                    .eq('id', article.id);

                console.log(`   ✅ Updated: ${newImageUrl.substring(0, 50)}...`);
            } else {
                console.log(`   ⚠️ Image generation failed, keeping existing image.`);
            }
        } catch (err) {
            console.error(`   ❌ Error:`, err);
        }

        // Rate limit protection
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("\n=== MASS IMAGE REGENERATION COMPLETE ===");
}

regenerateAllImages();
