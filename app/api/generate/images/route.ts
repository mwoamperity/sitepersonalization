import { NextRequest, NextResponse } from 'next/server';
import { searchImages } from '@/lib/ai/unsplash';
import type { SearchImagesRequest } from '@/types';

// POST /api/generate/images - Search Unsplash for images
export async function POST(request: NextRequest) {
  try {
    const body: SearchImagesRequest = await request.json();

    // Validate
    if (!body.query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const result = await searchImages({
      query: body.query,
      orientation: body.orientation || 'landscape',
      count: body.count || 8,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching images:', error);
    return NextResponse.json(
      { error: 'Image search failed. Please try again.' },
      { status: 500 }
    );
  }
}
