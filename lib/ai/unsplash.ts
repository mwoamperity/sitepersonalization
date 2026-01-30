// Unsplash API Client for Image Search
// Uses Unsplash API for high-quality stock photos

import type { SearchImagesRequest, SearchImagesResponse, UnsplashImage } from '@/types';

const UNSPLASH_API_BASE = 'https://api.unsplash.com';
const UTM_SOURCE = 'amperity_personalization';
const UTM_MEDIUM = 'referral';

function getAccessKey(): string {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    throw new Error('UNSPLASH_ACCESS_KEY environment variable is not set');
  }
  return key;
}

/**
 * Search for images on Unsplash
 */
export async function searchImages(request: SearchImagesRequest): Promise<SearchImagesResponse> {
  const accessKey = getAccessKey();
  const count = request.count || 8;
  const orientation = request.orientation || 'landscape';

  const params = new URLSearchParams({
    query: request.query,
    orientation,
    per_page: String(count),
  });

  const response = await fetch(
    `${UNSPLASH_API_BASE}/search/photos?${params.toString()}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unsplash API authentication failed. Check your access key.');
    }
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = await response.json();

  const images: UnsplashImage[] = data.results.map((photo: Record<string, unknown>) => {
    const urls = photo.urls as Record<string, string>;
    const user = photo.user as Record<string, unknown>;
    const userLinks = user.links as Record<string, string>;

    // Add UTM parameters for attribution compliance
    const addUtm = (url: string) => {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}`;
    };

    return {
      id: photo.id as string,
      url: addUtm(urls.regular),
      thumb_url: addUtm(urls.thumb),
      alt_description: (photo.alt_description as string) || (photo.description as string) || request.query,
      photographer: user.name as string,
      photographer_url: addUtm(userLinks.html),
      download_url: addUtm(urls.full),
    };
  });

  return { images };
}

/**
 * Get optimized image URL with specific dimensions
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  width: number,
  height?: number
): string {
  // Unsplash supports dynamic resizing via URL parameters
  const url = new URL(imageUrl);
  url.searchParams.set('w', String(width));
  if (height) {
    url.searchParams.set('h', String(height));
  }
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('auto', 'format');
  return url.toString();
}

/**
 * Build search keywords based on personalization context
 */
export function buildSearchKeywords(
  context: {
    type: 'location' | 'loyalty' | 're-engagement' | 'generic';
    value?: string;
  }
): string[] {
  switch (context.type) {
    case 'location':
      if (context.value) {
        return [
          `${context.value} travel`,
          `${context.value} skyline`,
          `${context.value} landmark`,
        ];
      }
      return ['travel destination', 'world travel'];

    case 'loyalty':
      return [
        'luxury travel',
        'first class',
        'premium experience',
        'business travel',
        'airport lounge',
      ];

    case 're-engagement':
      return [
        'adventure travel',
        'wanderlust',
        'explore',
        'vacation planning',
        'dream destination',
      ];

    case 'generic':
    default:
      return [
        'travel adventure',
        'airplane window',
        'world map',
        'vacation',
      ];
  }
}

/**
 * Search for images with automatic keyword building
 */
export async function searchContextualImages(
  context: {
    type: 'location' | 'loyalty' | 're-engagement' | 'generic';
    value?: string;
  },
  options?: {
    orientation?: 'landscape' | 'portrait' | 'squarish';
    count?: number;
  }
): Promise<SearchImagesResponse> {
  const keywords = buildSearchKeywords(context);

  // Search with the primary keyword
  const primaryResults = await searchImages({
    query: keywords[0],
    orientation: options?.orientation || 'landscape',
    count: options?.count || 8,
  });

  return primaryResults;
}
