export const prerender = false;

const HAMROPATRO_AREAS = 'https://keyvalue.hamropatro.com/kv/get/major-election-2082-areas::-1';
const NEPALVOTES_API = 'https://pub-4173e04d0b78426caa8cfa525f827daa.r2.dev/constituencies.json';

export async function GET() {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=20',
    };

    try {
        // Try HamroPatro first (fastest updates)
        let hpConstituencies = null;
        try {
            // Step 1: Get areas list
            const areasRes = await fetch(HAMROPATRO_AREAS);
            if (!areasRes.ok) throw new Error('Areas fetch failed');
            const areasJson = await areasRes.json();
            const areas = JSON.parse(areasJson.list[0].value);
            const areaIds = areas.map(a => a.id);

            // Step 2: Batch fetch area results in chunks of 30 (URL limit)
            const CHUNK_SIZE = 30;
            const allBatchItems = [];
            for (let i = 0; i < areaIds.length; i += CHUNK_SIZE) {
                const chunk = areaIds.slice(i, i + CHUNK_SIZE);
                const batchKeys = chunk.map(id => `major-election-2082-areas-${id}-result::-1`).join('::');
                const batchRes = await fetch(`https://keyvalue.hamropatro.com/kv/get/${batchKeys}`);
                if (batchRes.ok) {
                    const batchJson = await batchRes.json();
                    allBatchItems.push(...batchJson.list);
                }
            }

            // Step 3: Transform to NepalVotes-compatible format for result.astro
            hpConstituencies = [];
            const areaMap = {};
            areas.forEach(a => { areaMap[a.id] = a; });

            allBatchItems.forEach(item => {
                try {
                    const result = JSON.parse(item.value);
                    const area = areaMap[result.areaId] || {};
                    const constituency = {
                        code: `HOR-${result.areaId}`,
                        name: `${result.districtName || ''} ${result.areaName || ''}`.trim(),
                        nameEn: `${result.districtEnglishName || ''} ${result.areaNameEnglish || ''}`.trim(),
                        province: result.stateName || '',
                        district: result.districtName || '',
                        districtEn: result.districtEnglishName || '',
                        totalVoters: result.registeredVoters || area.registeredVoters || 0,
                        votesCast: result.totalCountedVotes || area.totalCastVotes || 0,
                        status: result.electionResultStatus === 'RESULT_ANNOUNCED' ? 'COMPLETED' : 'COUNTING',
                        candidates: (result.candidateResults || []).map(c => ({
                            candidateId: Number(c.candidateId),
                            name: c.englishName || '',
                            nameNp: c.name || '',
                            partyName: c.partyName || '',
                            partyId: c.partyId || '',
                            votes: c.votes || 0,
                            isWinner: c.winner || false,
                            imageUrl: c.imageUrl || '',
                        })),
                    };
                    hpConstituencies.push(constituency);
                } catch (e) { /* skip */ }
            });

            console.log(`[Proxy] HamroPatro: ${hpConstituencies.length} constituencies loaded`);
        } catch (e) {
            console.error('[Proxy] HamroPatro fetch failed:', e.message);
        }

        if (hpConstituencies && hpConstituencies.length > 0) {
            return new Response(JSON.stringify({
                source: 'hamropatro',
                timestamp: new Date().toISOString(),
                constituencies: hpConstituencies,
            }), { status: 200, headers });
        }

        // Fallback to NepalVotes R2
        let nvData = null;
        try {
            const nvRes = await fetch(NEPALVOTES_API, {
                headers: { 'Accept': 'application/json' },
            });
            if (nvRes.ok) {
                const text = await nvRes.text();
                if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
                    nvData = JSON.parse(text);
                }
            }
        } catch (e) {
            console.error('[Proxy] NepalVotes fetch failed:', e.message);
        }

        if (nvData && Array.isArray(nvData) && nvData.length > 0) {
            return new Response(JSON.stringify({
                source: 'nepalvotes',
                timestamp: new Date().toISOString(),
                constituencies: nvData,
            }), { status: 200, headers });
        }

        // Both failed
        return new Response(JSON.stringify({
            source: 'none',
            error: 'Both live data sources unavailable',
            timestamp: new Date().toISOString(),
        }), { status: 503, headers });

    } catch (error) {
        return new Response(JSON.stringify({
            source: 'none',
            error: error.message,
            timestamp: new Date().toISOString(),
        }), { status: 500, headers });
    }
}
