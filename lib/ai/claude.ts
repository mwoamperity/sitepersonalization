// Claude API Client for Copy Generation
// Uses Anthropic SDK for AI-powered content generation

import Anthropic from '@anthropic-ai/sdk';
import type { GenerateCopyRequest, GenerateCopyResponse, AnalyzeDataRequest, AnalysisResult } from '@/types';
import { COPY_GENERATION_PROMPT, DATA_ANALYSIS_PROMPT } from './prompts';

const MODEL = 'claude-sonnet-4-20250514';

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

/**
 * Generate marketing copy for personalization widget
 */
export async function generateCopy(request: GenerateCopyRequest): Promise<GenerateCopyResponse> {
  const client = getClient();

  const fieldsDescription = request.fields
    .map((f) => `- ${f.name}: ${f.description} (sample value: ${f.sample_value})`)
    .join('\n');

  const prompt = COPY_GENERATION_PROMPT
    .replace('{{brand_name}}', request.brand_name || 'the brand')
    .replace('{{user_goal}}', request.goal)
    .replace('{{tone}}', request.tone || 'Professional, warm, action-oriented')
    .replace('{{fields_description}}', fieldsDescription);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text content from response
  const textContent = message.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse the JSON response
  try {
    // Find JSON in the response (it might be wrapped in markdown code blocks)
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      headlines: parsed.headlines || [],
      subheadlines: parsed.subheadlines || [],
      cta_suggestions: parsed.cta_suggestions || [],
    };
  } catch (parseError) {
    console.error('Failed to parse Claude response:', textContent.text);
    // Return default values if parsing fails
    return {
      headlines: [
        `Welcome back, {{given_name}}!`,
        `{{given_name}}, we have something special for you`,
        `Your personalized experience awaits, {{given_name}}`,
      ],
      subheadlines: [
        `Discover offers tailored just for you`,
        `See what's new based on your preferences`,
      ],
      cta_suggestions: ['Learn More', 'Get Started', 'Explore Now'],
    };
  }
}

/**
 * Analyze customer data and recommend personalization strategies
 */
export async function analyzeData(request: AnalyzeDataRequest): Promise<AnalysisResult> {
  const client = getClient();

  // Build field analysis from profiles
  const allFields = new Map<string, {
    values: unknown[];
    types: Set<string>;
  }>();

  for (const profile of request.profiles) {
    for (const [key, value] of Object.entries(profile)) {
      if (!allFields.has(key)) {
        allFields.set(key, { values: [], types: new Set() });
      }
      const field = allFields.get(key)!;
      field.values.push(value);
      field.types.add(typeof value);
    }
  }

  // Format fields for prompt
  const fieldsDescription = Array.from(allFields.entries())
    .map(([name, data]) => {
      const nullCount = data.values.filter((v) => v === null || v === undefined).length;
      const nullRate = Math.round((nullCount / data.values.length) * 100);
      const samples = data.values
        .filter((v) => v !== null && v !== undefined)
        .slice(0, 3)
        .map((v) => JSON.stringify(v))
        .join(', ');
      const type = Array.from(data.types).join(' | ');
      return `- ${name} (${type}): Null rate: ${nullRate}%, Samples: ${samples}`;
    })
    .join('\n');

  const prompt = DATA_ANALYSIS_PROMPT
    .replace('{{user_goal}}', request.goal)
    .replace('{{fields_description}}', fieldsDescription);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text content from response
  const textContent = message.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse the JSON response
  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    const parsed = JSON.parse(jsonMatch[0]);

    // Transform to our expected format
    const recommendations = (parsed.recommendations || []).map((rec: Record<string, unknown>, index: number) => ({
      id: `rec-${String(index + 1).padStart(3, '0')}`,
      name: rec.name || 'Unnamed Recommendation',
      fields_used: rec.fields || [],
      strategy: (rec.fields as string[])?.length > 1 ? 'compound' : 'single',
      description: rec.rationale || '',
      example_output: rec.example_output || '',
      goal_alignment: rec.goal_alignment || rec.rationale || '',
      confidence: rec.confidence || 'medium',
    }));

    // Build field analysis
    const fieldAnalysis: Record<string, {
      null_rate: number;
      personalization_value: 'high' | 'medium' | 'low';
      use_cases: string[];
      sample_values: unknown[];
      data_type: string;
    }> = {};

    Array.from(allFields.entries()).forEach(([name, data]) => {
      const nullCount = data.values.filter((v) => v === null || v === undefined).length;
      const nullRate = nullCount / data.values.length;
      const nonNullValues = data.values.filter((v) => v !== null && v !== undefined);

      fieldAnalysis[name] = {
        null_rate: nullRate,
        personalization_value: nullRate < 0.2 ? 'high' : nullRate < 0.5 ? 'medium' : 'low',
        use_cases: [],
        sample_values: nonNullValues.slice(0, 3),
        data_type: Array.from(data.types)[0] || 'unknown',
      };
    });

    return {
      recommendations,
      field_analysis: fieldAnalysis,
    };
  } catch (parseError) {
    console.error('Failed to parse Claude analysis response:', textContent.text);
    throw new Error('Failed to analyze data');
  }
}
