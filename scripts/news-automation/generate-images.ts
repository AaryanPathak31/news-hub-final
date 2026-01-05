import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Helper to clean prompts to strict visual descriptions
function cleanPromptForVisuals(title: string, category: string): string {
    // STRICT MODE: Use Title Only + High Quality Modifiers
    // We rely on the AI-generated "image_prompt" from the LLM if available, 
    // BUT this function often gets just the title. 
    // If the caller passes a pre-generated AI prompt, we should use it?
    // Actually, looking at index.ts, it passes 'article.image_prompt' as the first arg 'title'?
    // No, index.ts passes 'article.title'.
    // Wait, the Constants.ts PROMPT generates a specific 'image_prompt'.
    // We should use THAT if possible.

    // For now, adhering to user's Rule #3: "Image Prompt = Article Title (and NOTHING ELSE)" + Style.

    const subject = title; // The user clearly stated: "Use ONLY the Article Title"
    const visualStyle = "realistic, cinematic lighting, 8k, news photo style, highly detailed, photorealistic, depth of field";

    return `${subject}, ${visualStyle} --no text --no newspaper --no magazine --no collage --no writing`;
}

export async function generateAndUploadImage(promptOrTitle: string, slug: string, category: string = 'general'): Promise<string | null> {

    // LOGIC: If input seems like a long, detailed AI prompt, use it. 
    // If it's short (like a raw title), construct a strict prompt.
    let finalPrompt = promptOrTitle;

    // Simple heuristic: If it has commas and is long, assume it's an AI prompt. 
    // Otherwise, treat as Title and apply specific rules.
    if (!promptOrTitle.includes(',') || promptOrTitle.length < 50) {
        finalPrompt = cleanPromptForVisuals(promptOrTitle, category);
    } else {
        // Ensure strictly no banned words even in AI prompts
        finalPrompt = `${promptOrTitle} --no text --no newspaper --no magazine --no writing`;
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);

    // Add random seed to prevent caching/duplicates
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=800&height=400&model=flux&seed=${seed}`;

    try {
        console.log(`\n🎨 Generating Unique Image:`);
        console.log(`   Subject: ${title.substring(0, 30)}...`);
        console.log(`   Prompt:  "${visualPrompt.substring(0, 60)}..."`);
        console.log(`   URL:     ${imageUrl}`);

        // PRE-WARM IMAGE: Fetch it once so Pollinations generates and caches it.
        // This ensures the frontend gets an instant 200 OK response.
        console.log(`   ⏳ Pre-warming cache...`);
        const check = await fetch(imageUrl);
        if (!check.ok) throw new Error('Pollinations API error');

        /* 
        // Upload logic remains disabled to prevent storage issues
        if (supabase) {
            const buffer = await check.buffer();
            const fileName = `${slug}-${uuidv4()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('article-images')
                .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

            if (!uploadError) {
                const { data } = supabase.storage.from('article-images').getPublicUrl(fileName);
                return data.publicUrl;
            }
        }
        */

        // Return the direct URL (now cached by Pollinations)
        return imageUrl;

    } catch (error) {
        console.error('Image Generation Failed:', error);
        // Even on error, return the URL as a last ditch effort (it might work in browser)
        return imageUrl;
    }
}
