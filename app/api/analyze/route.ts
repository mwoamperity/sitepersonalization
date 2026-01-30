import { NextRequest, NextResponse } from 'next/server';
import { analyzeData } from '@/lib/ai/claude';
import type { AnalyzeDataRequest } from '@/types';

// POST /api/analyze - AI data analysis
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeDataRequest = await request.json();

    // Validate
    if (!body.profiles || body.profiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one profile is required' },
        { status: 400 }
      );
    }

    if (!body.goal || body.goal.length < 10) {
      return NextResponse.json(
        { error: 'A meaningful goal is required (at least 10 characters)' },
        { status: 400 }
      );
    }

    const result = await analyzeData(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing data:', error);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
