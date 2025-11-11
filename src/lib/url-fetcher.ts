import { Readability } from '@mozilla/readability';

export interface UrlFetchResult {
  url: string;
  content?: string;
  title?: string;
  error?: string;
  fetchedAt: string;
  success: boolean;
}

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

export function detectUrls(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
}

export async function fetchUrlContent(url: string): Promise<UrlFetchResult> {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentFetcher/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        url,
        error: `HTTP ${response.status}: ${response.statusText}`,
        fetchedAt,
        success: false,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return {
        url,
        error: `Unsupported content type: ${contentType}`,
        fetchedAt,
        success: false,
      };
    }

    const html = await response.text();

    let JSDOM;
    try {
      const jsdomModule = await import('jsdom');
      JSDOM = jsdomModule.JSDOM;
    } catch (importError) {
      return {
        url,
        error: 'Failed to load HTML parser module',
        fetchedAt,
        success: false,
      };
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return {
        url,
        error: 'Could not extract article content from page',
        fetchedAt,
        success: false,
      };
    }

    const cleanContent = article.textContent
      .replace(/\s+/g, ' ')
      .trim();

    return {
      url,
      title: article.title || undefined,
      content: cleanContent,
      fetchedAt,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      url,
      error: `Failed to fetch: ${errorMessage}`,
      fetchedAt,
      success: false,
    };
  }
}

export async function fetchMultipleUrls(urls: string[]): Promise<UrlFetchResult[]> {
  if (urls.length === 0) return [];

  const fetchPromises = urls.map(url => fetchUrlContent(url));
  const results = await Promise.allSettled(fetchPromises);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        url: urls[index],
        error: `Promise rejected: ${result.reason}`,
        fetchedAt: new Date().toISOString(),
        success: false,
      };
    }
  });
}

export function enrichContextWithUrls(
  originalContext: string,
  fetchResults: UrlFetchResult[]
): string {
  const successfulFetches = fetchResults.filter(r => r.success && r.content);

  if (successfulFetches.length === 0) {
    return originalContext;
  }

  const urlContents = successfulFetches.map(result => {
    const header = result.title
      ? `Content from "${result.title}" (${result.url}):`
      : `Content from ${result.url}:`;
    return `\n\n${header}\n${result.content}`;
  }).join('\n');

  return `${originalContext}${urlContents}`;
}
