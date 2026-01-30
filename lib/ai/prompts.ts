// AI Prompt Templates
// Structured prompts for Claude API interactions

/**
 * Prompt template for generating marketing copy
 */
export const COPY_GENERATION_PROMPT = `You are a marketing copywriter specializing in website personalization. Generate compelling, concise copy for a personalization widget.

CONTEXT:
- Brand: {{brand_name}}
- Goal: {{user_goal}}
- Tone: {{tone}}

PERSONALIZATION FIELDS AVAILABLE:
{{fields_description}}

REQUIREMENTS:
1. Generate 3 headline variations (max 60 characters each)
2. Generate 2 subheadline variations (max 100 characters each)
3. Use {{field_name}} syntax for dynamic placeholders (e.g., {{given_name}}, {{destination}})
4. Ensure copy works grammatically with any field value
5. Create urgency or relevance without being pushy
6. Keep messaging positive and action-oriented

OUTPUT FORMAT (respond with valid JSON only):
{
  "headlines": ["...", "...", "..."],
  "subheadlines": ["...", "..."],
  "cta_suggestions": ["...", "..."]
}`;

/**
 * Prompt template for analyzing customer data
 */
export const DATA_ANALYSIS_PROMPT = `You are a personalization strategist analyzing customer data to recommend impactful website personalization strategies.

USER'S GOAL:
{{user_goal}}

AVAILABLE DATA FIELDS:
{{fields_description}}

TASK:
Analyze the available data and recommend 3-5 personalization strategies that align with the user's goal. For each recommendation:

1. Name the strategy clearly and descriptively
2. List the specific fields to use (from the available fields above)
3. Explain why this combination is valuable for the stated goal
4. Provide a concrete example of the personalized output (with placeholder values)
5. Note any data quality concerns (high null rates mean the field may not be reliable)
6. Rate confidence as high/medium/low based on data availability and goal alignment

PRIORITIZATION CRITERIA:
- Strategies using fields with low null rates (< 20%) are more reliable
- Compound strategies that combine multiple fields meaningfully
- Approaches that create emotional connection or urgency
- Direct alignment with the user's stated goal

OUTPUT FORMAT (respond with valid JSON only):
{
  "recommendations": [
    {
      "name": "Strategy Name",
      "fields": ["field1", "field2"],
      "rationale": "Why this strategy works...",
      "example_output": "Example personalized message with actual sample values",
      "data_quality_notes": "Any concerns about null rates or data quality",
      "confidence": "high|medium|low"
    }
  ]
}`;

/**
 * Prompt template for generating fallback content
 */
export const FALLBACK_CONTENT_PROMPT = `You are a marketing copywriter. Generate generic fallback content for a personalization widget when the user is not identified.

CONTEXT:
- Brand: {{brand_name}}
- Primary Goal: {{user_goal}}
- Industry: {{industry}}

The fallback content should:
1. Be welcoming and engaging to anonymous visitors
2. Align with the overall personalization goal
3. Not reference any personal data (since we don't know who they are)
4. Include a clear call-to-action

OUTPUT FORMAT (respond with valid JSON only):
{
  "headline": "...",
  "subheadline": "...",
  "cta_text": "..."
}`;

/**
 * Prompt for generating image search keywords
 */
export const IMAGE_KEYWORD_PROMPT = `Based on the following personalization context, suggest 3-5 search keywords for finding relevant stock photos.

CONTEXT:
- Personalization Type: {{personalization_type}}
- Target Value: {{target_value}}
- Industry: {{industry}}
- Goal: {{goal}}

Return keywords as a JSON array:
["keyword1", "keyword2", "keyword3"]`;
