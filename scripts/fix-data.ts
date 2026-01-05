import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateAndUploadImage } from './news-automation/generate-images.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function fixData() {
    console.log("Starting Hero Image Fix...");

    // 1. Fetch "Venezuela" / "US" articles (The User's specific complaint)
    const { data: venzArticles } = await supabase
        .from('articles')
        .select('*')
        .or('title.ilike.%Venezuela%,title.ilike.%US%')
        .is('is_breaking', true)
        .limit(5);

    if (venzArticles && venzArticles.length > 0) {
        for (const article of venzArticles) {
            const lowerTitle = article.title.toLowerCase();
            let specificPrompt = "";

            if (lowerTitle.includes('venezuela') && (lowerTitle.includes('attack') || lowerTitle.includes('threat') || lowerTitle.includes('military'))) {
                console.log(`Fixing Venezuela Article: ${article.title}`);
                specificPrompt = "military soldiers in conflict zone, venezuela flag, US military presence, tense geopolitical standoff, realistic news photo style, 8k --no newspaper --no text";
            }
            else if (lowerTitle.includes('us') && (lowerTitle.includes('probe') || lowerTitle.includes('murder'))) {
                console.log(`Fixing US Crime Article: ${article.title}`);
                specificPrompt = "police investigation scene, crime tape, detectives, night city background, blue and red lights, realistic news photo style --no newspaper";
            }

            if (specificPrompt) {
                const newImage = await generateAndUploadImage(specificPrompt, article.slug);
                if (newImage) {
                    await supabase
                        .from('articles')
                        .update({ featured_image: newImage })
                        .eq('id', article.id);
                    console.log("  -> Regenerated Image:", newImage);
                }
            }
        }
    } else {
        console.log("No matching Venezuela/US breaking news found to fix.");
    }

    // 3. Mass Fix Top Breaking News (The "Nuclear Option" for Generic Images)
    console.log("Starting Mass Cleanup of Breaking News...");
    const { data: allBreaking } = await supabase
        .from('articles')
        .select('*')
        .eq('is_breaking', true)
        .order('published_at', { ascending: false })
        .limit(10); // Fix the top 10 visible articles

    if (allBreaking) {
        for (const article of allBreaking) {
            const lowerTitle = article.title.toLowerCase();
            // Skip if we just fixed it (Venezuela)
            if (lowerTitle.includes('venezuela') || lowerTitle.includes('colombia')) continue;

            let prompt = `news photo of ${article.title}, realistic, 8k, cinematic lighting, journalism style --no newspaper`;

            // Enforce Rules based on Category/Title
            if (lowerTitle.includes('india') || lowerTitle.includes('delhi')) {
                prompt = `street scene in india, busy market or modern infrastructure, indian flag, realistic news photo style, 8k`;
            } else if (lowerTitle.includes('tech') || lowerTitle.includes('ai') || lowerTitle.includes('google')) {
                prompt = `modern technology background, server room, code screen, artificial intelligence concept, blue lighting, realistic`;
            } else if (lowerTitle.includes('budget') || lowerTitle.includes('economy')) {
                prompt = `financial graph, indian currency, stock market, business meeting, realistic news photo style`;
            } else if (lowerTitle.includes('cricket') || lowerTitle.includes('sport')) {
                prompt = `cricket stadium, floodlights, match action, energetic atmosphere, realistic news photo style`;
            }

            console.log(`Regenerating Breaking News: ${article.title}`);
            const newImage = await generateAndUploadImage(prompt, article.slug);
            if (newImage) {
                await supabase.from('articles').update({ featured_image: newImage }).eq('id', article.id);
            }
        }
    }

    // 2. Fix ALL Breaking News that might have generic images (Safety Net)
    // We check for "World" category articles in breaking news
    const { data: breakingWorld } = await supabase
        .from('articles')
        .select('*, categories(name)')
        .eq('is_breaking', true)
        .limit(10);

    // (Optional: Add more logic here if needed, but keeping it focused on the user's report for now)

    console.log("Fix Complete.");
}

fixData();
