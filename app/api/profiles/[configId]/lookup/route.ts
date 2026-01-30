import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/db';
import { lookupProfile, extractPersonalizationData } from '@/lib/amperity';

// GET /api/profiles/:configId/lookup - Widget profile lookup
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const { configId } = await params;
    const { searchParams } = new URL(request.url);
    const idValue = searchParams.get('id_value');

    if (!idValue) {
      return NextResponse.json(
        { personalization_data: {}, has_identity: false }
      );
    }

    // Get config with credentials
    const config = await getConfig(configId, true);

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Look up the profile
    const profile = await lookupProfile(config.api_config, idValue);

    // Extract only the fields needed for personalization
    const result = extractPersonalizationData(
      profile,
      config.personalization.fields_used
    );

    // Add CORS headers for widget access
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error looking up profile:', error);
    return NextResponse.json(
      { personalization_data: {}, has_identity: false },
      { status: 200 } // Return 200 with empty data instead of error for widget resilience
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
