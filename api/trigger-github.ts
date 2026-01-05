export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { categories } = req.body;

    // Use Vercel Env Vars for GitHub Auth
    const token = process.env.GITHUB_PAT;
    const owner = 'AaryanPathak31'; // Hardcoded for now based on user's repo URL
    const repo = 'news-hub-final'; // Hardcoded based on user's repo URL

    if (!token) {
        return res.status(500).json({ error: 'Missing GITHUB_PAT env var' });
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/generate-news.yml/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    categories: categories || 'all'
                }
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`GitHub API Error: ${response.status} ${text}`);
        }

        res.status(200).json({ success: true, message: 'Generation triggered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
