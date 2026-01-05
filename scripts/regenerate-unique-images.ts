import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateAndUploadImage } from './news-automation/generate-images.js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    console.log("=== STARTING MASS UNIQUE IMAGE GENERATION ===");

    // Fetch all articles
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, slug, category:categories(slug)')
        .order('published_at', { ascending: false });

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    console.log(`Processing ${articles.length} articles...`);

    for (const article of articles) {
        const category = (article.category as any)?.slug || 'general';

        // Generate new image
        const newUrl = await generateAndUploadImage(article.title, article.slug, category);

        if (newUrl) {
            // Update DB
            await supabase
                .from('articles')
                .update({ featured_image: newUrl })
                .eq('id', article.id);

            console.log(`✅ Updated: ${article.title}`);
        } else {
            console.log(`❌ Failed: ${article.title}`);
        }

        // Be nice to the API
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("=== DONE ===");
}

run();
