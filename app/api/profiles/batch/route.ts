import { NextRequest, NextResponse } from 'next/server';
import { lookupProfiles } from '@/lib/amperity';
import type { ApiConfig } from '@/types';

interface BatchRequest {
  api_config: ApiConfig;
  ids: string[];
}

// POST /api/profiles/batch - Fetch multiple profiles
export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();

    // Validate
    if (!body.api_config || !body.ids || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'API config and IDs are required' },
        { status: 400 }
      );
    }

    if (body.ids.length > 15) {
      return NextResponse.json(
        { error: 'Maximum 15 IDs allowed per request' },
        { status: 400 }
      );
    }

    const results = await lookupProfiles(body.api_config, body.ids);

    return NextResponse.json({
      profiles: results.map((r) => r.profile),
      results,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
