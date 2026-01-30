import { NextRequest, NextResponse } from 'next/server';
import { generateCopy } from '@/lib/ai/claude';
import type { GenerateCopyRequest } from '@/types';

// POST /api/generate/copy - AI copy generation
export async function POST(request: NextRequest) {
  try {
    const body: GenerateCopyRequest = await request.json();

    // Validate
    if (!body.fields || body.fields.length === 0) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      );
    }

    if (!body.goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      );
    }

    const result = await generateCopy(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating copy:', error);
    return NextResponse.json(
      { error: 'Copy generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
