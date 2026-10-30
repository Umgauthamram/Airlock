export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

export interface TavilySearchResponse {
  answer?: string;
  results: TavilySearchResult[];
}

/**
 * Real runtime web search via Tavily Search API.
 * Executes on the host side only; never exposed inside the worker sandbox.
 */
export async function web_search(query: string, maxResults = 5): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('TAVILY_API_KEY is not configured on the gateway host. Real web search requires a valid Tavily API key.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        max_results: maxResults,
        include_answer: true,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Tavily API search failed with status ${res.status}: ${errText || res.statusText}`);
    }

    const data = await res.json();
    return {
      answer: data.answer || '',
      results: (data.results || []).map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || '',
      })),
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Tavily API search request timed out after 8000ms.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
