import { NextRequest, NextResponse } from 'next/server';
import { createConfig, listConfigs } from '@/lib/db';
import { generateEmbedSnippet } from '@/lib/widget/builder';
import type { CreateConfigRequest } from '@/types';

// POST /api/configs - Create new configuration
export async function POST(request: NextRequest) {
  try {
    const body: CreateConfigRequest = await request.json();

    // Validate required fields
    if (!body.api_config?.tenant_id || !body.api_config?.api_endpoint || !body.api_config?.bearer_token) {
      return NextResponse.json(
        { error: 'Missing required API configuration fields' },
        { status: 400 }
      );
    }

    if (!body.personalization?.fields_used || body.personalization.fields_used.length === 0) {
      return NextResponse.json(
        { error: 'At least one personalization field is required' },
        { status: 400 }
      );
    }

    // Create the configuration
    const config = await createConfig({
      api_config: body.api_config,
      personalization: body.personalization,
      widget_config: body.widget_config,
      identity_config: body.identity_config || {
        allowed_domains: ['*'],
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const snippet = generateEmbedSnippet(config.id, appUrl);

    return NextResponse.json({
      config_id: config.id,
      snippet,
      preview_url: `${appUrl}/preview/${config.id}`,
    });
  } catch (error) {
    console.error('Error creating config:', error);
    return NextResponse.json(
      { error: 'Failed to create configuration' },
      { status: 500 }
    );
  }
}

// GET /api/configs - List all configurations
export async function GET() {
  try {
    const configs = await listConfigs();
    return NextResponse.json({ configs });
  } catch (error) {
    console.error('Error listing configs:', error);
    return NextResponse.json(
      { error: 'Failed to list configurations' },
      { status: 500 }
    );
  }
}
