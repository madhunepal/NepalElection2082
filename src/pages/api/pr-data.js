export const prerender = false;

const PR_PARTIES_API = 'https://pub-4173e04d0b78426caa8cfa525f827daa.r2.dev/pr_parties.json';

export async function GET() {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
    };

    try {
        const res = await fetch(PR_PARTIES_API, {
            headers: { 'Accept': 'application/json' },
        });

        if (!res.ok) {
            throw new Error(`PR data fetch failed: ${res.status}`);
        }

        const data = await res.json();

        return new Response(JSON.stringify({
            totalPrVotes: data.totalPrVotes || 0,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            parties: data.parties || [],
        }), { status: 200, headers });

    } catch (error) {
        console.error('[PR Proxy] Fetch failed:', error.message);
        return new Response(JSON.stringify({
            error: error.message,
            totalPrVotes: 0,
            parties: [],
        }), { status: 500, headers });
    }
}
