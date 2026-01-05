import { fetchNews } from './fetch-news.js';
import { processNewsItem } from './ai-processor.js';
import { generateAndUploadImage } from './generate-images.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Simple slugify fallback
function makeSlug(text: string) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function getOrCreateCategory(name: string) {
    if (!supabase) return null;

    // Normalize category name
    let finalName = name || 'General';
    // Capitalize first letter
    finalName = finalName.charAt(0).toUpperCase() + finalName.slice(1);

    const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', finalName)
        .maybeSingle();

    if (existing) return existing.id;

    // Create if not exists
    const { data: newVal, error } = await supabase
        .from('categories')
        .insert({ name: finalName, slug: makeSlug(finalName) })
        .select('id')
        .single();

    if (error) {
        console.error(`Error creating category ${finalName}:`, error);
        return null;
    }
    return newVal.id;
}

async function getSystemAuthorId() {
    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
    return data?.id || null;
}

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function run() {
    console.log('Starting News Automation Pipeline...');

    if (!supabase) {
        console.error('Supabase credentials missing. Aborting.');
        process.exit(1);
    }

    // Check for CLI args first
    const args = process.argv.slice(2);
    const categoryArg = args.find(a => a.startsWith('--category='))?.split('=')[1];

    let targetCategory = '';

    if (categoryArg) {
        targetCategory = categoryArg.trim();
        console.log(`\nCLI Selected Category: "${targetCategory}"`);
    } else {
        // Interactive Category Selection
        console.log('\n--- Manual News Generation ---');
        console.log('Available Categories: All, India, World, Business, Technology, Sports, Entertainment');
        try {
            // Timeout prompt after 5 seconds to default to ALL if run non-interactively
            const promptPromise = askQuestion('Enter category to generate (or leave empty for All): ');
            const timeoutPromise = new Promise<string>((resolve) => setTimeout(() => resolve(''), 5000));
            const selectedCategoryInput = await Promise.race([promptPromise, timeoutPromise]);
            targetCategory = selectedCategoryInput.trim();
        } catch (e) {
            console.log('Skipping interactive prompt (non-interactive env).');
        }
    }

    if (targetCategory) {
        console.log(`\nSelected Category: "${targetCategory}"`);
    } else {
        console.log('\nGenerating for ALL categories...');
    }

    // 1. Fetch Raw News
    let rawItems = await fetchNews();

    // Filter by category if selected
    if (targetCategory) {
        rawItems = rawItems.filter(item =>
            item.category.toLowerCase() === targetCategory.toLowerCase()
        );
        if (rawItems.length === 0) {
            console.log(`No articles found for category "${targetCategory}" in the feeds.`);
            // Try lenient matching
            console.log('Trying loose match...');
            rawItems = (await fetchNews()).filter(item =>
                item.category.toLowerCase().includes(targetCategory.toLowerCase()) ||
                item.title.toLowerCase().includes(targetCategory.toLowerCase())
            );
        }
    }

    console.log(`Processing ${rawItems.length} items...`);

    const authorId = await getSystemAuthorId();

    for (const item of rawItems) {
        // Check if article with same title already exists (simple dedup)
        const { data: existing } = await supabase
            .from('articles')
            .select('id')
            .eq('title', item.title)
            .maybeSingle();

        if (existing) {
            // console.log(`Skipping duplicate: ${item.title}`);
            continue;
        }

        // 2. Process with AI
        const processed = await processNewsItem(item);
        if (!processed) continue;

        const slug = makeSlug(processed.title);

        // 3. Generate Image
        const imageUrl = await generateAndUploadImage(processed.title, slug);

        // 4. Resolve Category
        const categoryId = await getOrCreateCategory(processed.category);

        // 5. Save to Database
        const { error } = await supabase
            .from('articles')
            .insert({
                title: processed.title,
                slug: slug,
                content: processed.content,
                excerpt: processed.excerpt,
                category_id: categoryId,
                featured_image: imageUrl,
                status: 'published',
                published_at: new Date().toISOString(),
                author_id: authorId,
                tags: processed.tags,
                is_breaking: true, // Auto-mark as breaking
                is_featured: (processed.category === 'India')
            });

        if (error) {
            console.error('Error saving article:', error);
        } else {
            console.log(`Successfully published (Breaking): ${processed.title}`);
        }

        // Anti-rate-limit delay for Free Tier/Experimental models
        await new Promise(r => setTimeout(r, 5000));
    }

    // 6. Maintenance: Keep only top 30 Breaking News
    console.log('Running breaking news maintenance...');
    const { data: allBreaking } = await supabase
        .from('articles')
        .select('id, published_at')
        .eq('is_breaking', true)
        .order('published_at', { ascending: false });

    if (allBreaking && allBreaking.length > 30) {
        const toDemote = allBreaking.slice(30);
        const ids = toDemote.map(a => a.id);

        console.log(`Demoting ${ids.length} old breaking news articles...`);

        await supabase
            .from('articles')
            .update({ is_breaking: false })
            .in('id', ids);
    }

    console.log('Pipeline finished.');
}

run();
