import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { slugify } from '../../src/lib/utils'; // Try to use this, if fail fallback

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) process.exit(1);

const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback slugify
function makeSlug(text: string) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function checkAndSeedCategories() {
    console.log('Checking categories...');

    const { data: categories, error } = await supabase.from('categories').select('*');

    if (error) {
        console.error('Error fetching categories:', error);
        return;
    }

    console.log(`Found ${categories.length} categories.`);

    if (categories.length === 0) {
        console.log('Seeding default categories...');
        const defaults = ['Technology', 'India', 'World', 'Business', 'Sports', 'Entertainment', 'Health', 'Politics'];

        for (const name of defaults) {
            await supabase.from('categories').insert({
                name,
                slug: makeSlug(name),
                description: `News about ${name}`
            });
        }
        console.log('Seeding complete.');
    } else {
        console.log('Categories exist:', categories.map(c => c.name).join(', '));
    }
}

checkAndSeedCategories();
