import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/db';
import { generateWidgetCode } from '@/lib/widget/builder';

// GET /api/widget - Serve widget JavaScript bundle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('config');

    if (!configId) {
      return new NextResponse(
        '// Error: Missing config parameter',
        {
          status: 400,
          headers: {
            'Content-Type': 'application/javascript',
          },
        }
      );
    }

    // Get config (without credentials - we don't need them in the widget code)
    const config = await getConfig(configId, false);

    if (!config) {
      return new NextResponse(
        '// Error: Configuration not found',
        {
          status: 404,
          headers: {
            'Content-Type': 'application/javascript',
          },
        }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const widgetCode = generateWidgetCode(config, appUrl);

    return new NextResponse(widgetCode, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error serving widget:', error);
    return new NextResponse(
      '// Error: Failed to load widget',
      {
        status: 500,
        headers: {
          'Content-Type': 'application/javascript',
        },
      }
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
