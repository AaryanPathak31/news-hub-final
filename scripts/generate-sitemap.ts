import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE_URL = 'https://nonamenews.site';

// Static routes configuration
const STATIC_ROUTES = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    // Categories
    '/breaking',
    '/india',
    '/world',
    '/politics',
    '/technology',
    '/business',
    '/sports',
    '/entertainment',
    '/health'
];

interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}

// Helper to escape XML special characters
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
        return c;
    });
}

function formatDateW3C(date: string | Date): string {
    return new Date(date).toISOString();
}

async function generateSitemap() {
    console.log('Starting sitemap generation...');

    // 1. Fetch Articles
    const { data: articles, error } = await supabase
        .from('articles')
        .select(`
      id,
      slug,
      title,
      updated_at,
      published_at,
      created_at,
      categories (
        slug
      )
    `)
        .eq('status', 'published');

    if (error) {
        console.error('Error fetching articles:', error);
        return;
    }

    console.log(`Found ${articles?.length || 0} published articles.`);

    const seenSlugs = new Set<string>();
    const postsUrls: SitemapUrl[] = [];
    const newsUrls: any[] = []; // Specific format for Google News

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // 2. Process Articles
    if (articles) {
        articles.forEach((article: any) => {
            const categorySlug = article.categories?.slug;
            // Deduplication: Only add first occurrence of a slug
            if (categorySlug && article.slug && !seenSlugs.has(article.slug)) {
                seenSlugs.add(article.slug);

                const loc = `${BASE_URL}/${categorySlug}/${article.slug}`;
                const lastmod = article.updated_at || article.published_at || article.created_at || new Date().toISOString();
                const pubDate = new Date(article.published_at || article.created_at);

                // Add to Posts Sitemap (Canonical Archive)
                postsUrls.push({
                    loc,
                    lastmod,
                    changefreq: 'weekly',
                    priority: 0.6
                });

                // Add to News Sitemap if < 48 hours old
                if (pubDate > fortyEightHoursAgo) {
                    newsUrls.push({
                        loc,
                        date: pubDate,
                        title: article.title,
                        publication_name: 'NoNameNews',
                        publication_language: 'en'
                    });
                }
            }
        });
    }

    // 3. Process Static Pages & Categories
    const categoryUrls: SitemapUrl[] = [];
    const staticPageUrls: SitemapUrl[] = [];

    // Identify category routes (simple heuristic: not standard pages and not root)
    const standardPages = ['', '/about', '/contact', '/privacy', '/terms', '/cookies'];

    STATIC_ROUTES.forEach(route => {
        const isCategory = !standardPages.includes(route);
        const urlObj = {
            loc: `${BASE_URL}${route}`,
            changefreq: 'daily' as const,
            priority: route === '' ? 1.0 : 0.8
        };

        if (isCategory) {
            categoryUrls.push(urlObj);
        } else {
            staticPageUrls.push(urlObj);
        }
    });

    // --- GENERATE XML FILES ---

    const generateUrlSet = (urls: SitemapUrl[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${formatDateW3C(url.lastmod)}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Google News Sitemap Format
    const generateNewsSitemap = (items: any[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items.map(item => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(item.publication_name)}</news:name>
        <news:language>${item.publication_language}</news:language>
      </news:publication>
      <news:publication_date>${formatDateW3C(item.date)}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

    // Write Sub-Sitemaps
    fs.writeFileSync(path.join(publicDir, 'sitemap-posts.xml'), generateUrlSet(postsUrls));
    fs.writeFileSync(path.join(publicDir, 'sitemap-news.xml'), generateNewsSitemap(newsUrls));
    fs.writeFileSync(path.join(publicDir, 'sitemap-categories.xml'), generateUrlSet(categoryUrls));
    fs.writeFileSync(path.join(publicDir, 'sitemap-static.xml'), generateUrlSet(staticPageUrls));

    // Generate Sitemap Index
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-news.xml</loc>
    <lastmod>${formatDateW3C(new Date())}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-posts.xml</loc>
    <lastmod>${formatDateW3C(new Date())}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-categories.xml</loc>
    <lastmod>${formatDateW3C(new Date())}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-static.xml</loc>
    <lastmod>${formatDateW3C(new Date())}</lastmod>
  </sitemap>
</sitemapindex>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);

    console.log(`
    ✅ Sitemaps Generated:
    ----------------------
    - sitemap.xml (Index)
    - sitemap-news.xml (${newsUrls.length} recent articles)
    - sitemap-posts.xml (${postsUrls.length} total articles)
    - sitemap-categories.xml (${categoryUrls.length} categories)
    - sitemap-static.xml (${staticPageUrls.length} pages)
    `);
}

generateSitemap().catch(console.error);
