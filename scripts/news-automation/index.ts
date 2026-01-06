import { fetchNews } from './fetch-news.js';
import { processNewsItem } from './ai-processor.js';
import { generateAndUploadImage } from './generate-images.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as readline from 'readline';
import stringSimilarity from 'string-similarity';

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
    const categoriesArg = args.find(a => a.startsWith('--categories='))?.split('=')[1];
    const isAll = args.includes('--all') || process.env.CI === 'true';

    let targetCategories: string[] = [];

    if (categoriesArg) {
        // Handle "Business,Tech"
        targetCategories = categoriesArg.split(',').map(c => c.trim()).filter(Boolean);
        if (targetCategories.includes('all')) {
            console.log('\nStarting generation for ALL categories...');
            targetCategories = []; // Empty means all
        } else {
            console.log(`\nStarting generation for selected categories: ${targetCategories.join(', ')}`);
        }
    } else if (categoryArg) {
        targetCategories = [categoryArg.trim()];
        console.log(`\nStarting generation for category: "${targetCategories[0]}"`);
    } else if (isAll) {
        console.log('\nRunning in Non-Interactive Mode (Generating ALL categories)...');
        targetCategories = [];
    } else {
        // Interactive Category Selection
        console.log('\n--- Manual News Generation ---');
        console.log('Available Categories: All, India, World, Business, Technology, Sports, Entertainment, Health');
        try {
            // Timeout prompt after 5 seconds to default to ALL if run non-interactively
            const promptPromise = askQuestion('Enter category to generate (or leave empty for All): ');
            const timeoutPromise = new Promise<string>((resolve) => setTimeout(() => resolve(''), 5000));
            const selectedCategoryInput = await Promise.race([promptPromise, timeoutPromise]);
            if (selectedCategoryInput.trim()) {
                targetCategories = [selectedCategoryInput.trim()];
            }
        } catch (e) {
            console.log('Skipping interactive prompt (non-interactive env).');
        }
    }

    // 1. Fetch Raw News
    let rawItems = await fetchNews();

    // Filter by categories if selected
    if (targetCategories.length > 0) {
        rawItems = rawItems.filter(item =>
            targetCategories.some(cat =>
                item.category.toLowerCase() === cat.toLowerCase()
            )
        );

        if (rawItems.length === 0) {
            console.log(`No articles found for selected categories in the feeds.`);
        }
    }

    console.log(`Processing ${rawItems.length} items...`);

    const authorId = await getSystemAuthorId();

    // Fetch recent articles for deduplication logic
    const { data: recentArticles } = await supabase
        .from('articles')
        .select('id, title')
        .order('published_at', { ascending: false })
        .limit(100);

    // Store as array of objects for fuzzy matching
    const knownArticles = recentArticles?.map(a => ({ id: a.id, title: a.title })) || [];

    console.log(`Loaded ${knownArticles.length} recent articles for deduplication check.`);

    // Helper for fuzzy match - Returns the matching article or null
    const findDuplicate = (newTitle: string) => {
        // 1. Check exact match
        const exact = knownArticles.find(a => a.title === newTitle);
        if (exact) return exact;

        // 2. Check fuzzy match
        for (const existing of knownArticles) {
            const similarity = stringSimilarity.compareTwoStrings(newTitle.toLowerCase(), existing.title.toLowerCase());
            if (similarity > 0.6) { // 60% similarity threshold
                console.log(`[Dedup] Match found: "${newTitle}" ~ "${existing.title}" (${(similarity * 100).toFixed(1)}%)`);
                return existing;
            }
        }
        return null;
    };

    for (const item of rawItems) {
        const existingArticle = findDuplicate(item.title);

        // 2. Process with AI
        const processed = await processNewsItem(item);
        if (!processed) continue;

        const slug = makeSlug(processed.title);

        // 3. Generate Image
        const imageUrl = await generateAndUploadImage(
            processed.image_prompt,
            slug
        );

        // 4. Resolve Category
        const categoryId = await getOrCreateCategory(processed.category);

        if (existingArticle) {
            // --- UPDATE EXISTING ARTICLE ---
            console.log(`[Update] Updating existing article ID: ${existingArticle.id}`);

            const { error: updateError } = await supabase
                .from('articles')
                .update({
                    title: processed.title, // Update title if AI improved it
                    content: processed.content,
                    excerpt: processed.excerpt,
                    featured_image: imageUrl, // Update image
                    updated_at: new Date().toISOString(), // Bump updated_at
                    // We DO NOT change slug, created_at, or id to preserve SEO
                    is_breaking: true // Re-flag as breaking if it's a major update
                })
                .eq('id', existingArticle.id);

            if (updateError) {
                console.error('Error updating article:', updateError);
            } else {
                console.log(`Successfully UPDATED: ${processed.title}`);
            }

        } else {
            // --- INSERT NEW ARTICLE ---
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
                    is_breaking: true,
                    secondary_category: processed.secondary_category,
                    is_featured: (processed.category === 'India')
                });

            if (error) {
                console.error('Error saving article:', error);
            } else {
                console.log(`Successfully PUBLISHED: ${processed.title}`);
                // Add to local cache so we don't duplicate it immediately in this same run
                knownArticles.push({ id: 'temp-new-id', title: processed.title });
            }
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
