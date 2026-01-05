import { GoogleGenerativeAI } from '@google/generative-ai';
import { RawNewsItem } from './fetch-news.js';
import { SYSTEM_PROMPT } from './constants.js';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ProcessedArticle {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    original_url: string;
    source: string;
    category: string;
}

export async function processNewsItem(item: RawNewsItem): Promise<ProcessedArticle | null> {
    if (!genAI) {
        console.warn('GEMINI_API_KEY not found. Skipping AI rewriting.');
        return null;
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
    });
    console.log('Using Gemini Model:', model.model);

    const prompt = `
    Original Title: ${item.title}
    Original Content: ${item.content}
    
    Rewrite this article following the system instructions.
  `;

    // Retry logic for rate limits/overload
    let retries = 3;
    while (retries > 0) {
        try {
            console.log(`Processing article: ${item.title}`);
            const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
            const responseText = result.response.text();

            // Clean up Markdown if present
            const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanText);

            return {
                title: data.title,
                excerpt: data.excerpt,
                content: data.content,
                tags: data.tags || [],
                original_url: item.link,
                source: item.source,
                category: item.category
            };

        } catch (error: any) {
            const isRateLimit = error.message?.includes('429') || error.message?.includes('503') || error.status === 429;

            if (isRateLimit && retries > 1) {
                console.log('Rate limit hit (Gemini 2.0 is busy). Waiting 20s...');
                await new Promise(r => setTimeout(r, 20000));
                retries--;
                continue;
            }

            console.error('Error processing article with AI:', error);
            // Fallback to gemini-1.5-flash if 2.0 fails hard? 
            // For now just return null
            return null;
        }
    }
    return null;
}
