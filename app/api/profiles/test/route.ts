import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/amperity';
import type { TestConnectionRequest } from '@/types';

// POST /api/profiles/test - Test API connection
export async function POST(request: NextRequest) {
  try {
    const body: TestConnectionRequest = await request.json();

    // Validate required fields
    if (!body.tenant_id || !body.api_endpoint || !body.bearer_token || !body.test_value) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await testConnection(
      {
        tenant_id: body.tenant_id,
        api_endpoint: body.api_endpoint,
        bearer_token: body.bearer_token,
        id_type: body.id_type,
      },
      body.test_value
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      { success: false, error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
