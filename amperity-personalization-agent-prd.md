# Product Requirements Document: Amperity Website Personalization Agent

**Version:** 1.0  
**Author:** Marcus (Amperity Lead Presales Consultant)  
**Date:** January 30, 2026  
**Status:** Draft for Internal Exploration / Demo

---

## Executive Summary

The Amperity Website Personalization Agent is a proof-of-concept tool that enables marketers to create AI-powered, data-driven website personalization widgets using customer data from Amperity's Profile API. The system guides users through an intelligent wizard that analyzes their customer data, recommends personalization strategies, generates creative assets, and outputs deployable JavaScript snippets.

**Primary Use Cases:**
1. Demonstrate Amperity Profile API value in presales scenarios
2. Enable rapid prototyping of personalization use cases for prospects/customers
3. Showcase CDP-to-activation pipeline in a tangible, visual way

---

## Problem Statement

Today, demonstrating the value of Amperity's Profile API requires either:
- Custom development for each prospect demo
- Abstract explanations of "what's possible"
- Reliance on third-party personalization tools that don't showcase Amperity's unique capabilities

This tool bridges the gap between "we have rich customer data" and "here's what you can do with it" in a self-service, wizard-driven experience.

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User's Website                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  <script src="widget.js?config=abc123"></script>            │   │
│  │  <!-- Renders personalized hero/inline content -->          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Personalization Service (Vercel)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Widget       │  │ Config       │  │ Asset Generation         │  │
│  │ Renderer     │  │ Manager      │  │ Service (AI Images/Copy) │  │
│  │ (SSR/Hybrid) │  │ (CRUD)       │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│         │                 │                      │                  │
│         └─────────────────┼──────────────────────┘                  │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Credential Store (Encrypted)                    │   │
│  │  - Tenant ID, API URL, Bearer Token per configuration       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Amperity Profile API                             │
│  GET /prof/profiles/{endpoint}/lookup?{id_type}={id_value}          │
│  Returns: Customer 360 JSON payload                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend (Wizard) | Next.js 14 (App Router) | SSR, API routes, Vercel-native |
| Widget Runtime | Vanilla JS + Preact | Minimal bundle size, no framework dependency on host site |
| Backend API | Next.js API Routes | Co-located with frontend, serverless |
| Database | Vercel KV (Redis) or Postgres | Config storage, session management |
| Image Service | Unsplash API | Free, high-quality stock photos, keyword-based search |
| AI Copy Generation | Claude API (claude-sonnet-4-20250514) | High-quality marketing copy |
| Deployment | Vercel | Zero-config, edge functions, environment management |

---

## Functional Requirements

### FR-1: Configuration Wizard

The wizard is a standalone web application that guides users through personalization setup.

#### FR-1.1: API Configuration Step

**User Story:** As a marketer, I need to connect my Amperity Profile API so the system can access my customer data.

**Input Fields:**
- `tenant_id` (string, required): Amperity tenant identifier (e.g., "acme-travel-hospitality")
- `api_endpoint` (string, required): Profile API endpoint ID (e.g., "apc-Tz8kHog3")
- `bearer_token` (string, required, sensitive): API authentication token
- `id_type` (enum, required): Primary lookup key type
  - Options: `email`, `amperity_id`, `cookie_id`, `maid`, `custom`
  - If `custom`: additional field for custom ID field name

**Validation:**
- Test API connectivity with a sample call before proceeding
- Display clear error messages for authentication failures
- Show sample response structure on successful connection

**API Call Pattern:**
```bash
curl -H "Amperity-Tenant: {tenant_id}" \
     -H "Authorization: Bearer {bearer_token}" \
     "https://{tenant_id}.amperity.com/prof/profiles/{api_endpoint}/lookup?{id_type}={test_value}"
```

#### FR-1.2: Sample Data Collection Step

**User Story:** As a marketer, I want to provide sample customer IDs so the agent can analyze my data structure.

**Input:**
- 5-10 sample IDs matching the configured `id_type`
- Text area with one ID per line or comma-separated

**Processing:**
- Call Profile API for each provided ID (parallel requests)
- Aggregate responses to identify:
  - Common fields across all profiles
  - Field data types (string, number, boolean, date, object)
  - Field value distributions (for recommendations)
  - Null/missing field patterns

**Output:**
- Display discovered schema with field names, types, and sample values
- Highlight fields with high personalization potential (non-null, varied values)

#### FR-1.3: Goal Definition Step

**User Story:** As a marketer, I want to describe my personalization goal so the agent can recommend relevant data points.

**Input:**
- Free-text goal description (required, 50-500 characters)
- Optional: Select from common goal templates
  - "Increase booking conversions"
  - "Promote loyalty program enrollment"
  - "Reduce cart abandonment"
  - "Cross-sell related products"
  - "Welcome returning customers"
  - "Re-engage lapsed customers"

**Examples of valid goals:**
- "I want to show personalized destination recommendations to encourage flight bookings"
- "I want to welcome loyalty members by name and show their tier benefits"
- "I want to remind customers about their upcoming trip and offer relevant add-ons"

#### FR-1.4: AI-Powered Data Analysis & Recommendation Step

**User Story:** As a marketer, I want the agent to recommend which data points to use for personalization based on my goal and available data.

**Agent Behavior:**

The agent MUST analyze the sample API responses and user's goal to recommend personalization strategies. The agent should:

1. **Identify High-Value Fields:** Fields that are:
   - Frequently populated (low null rate)
   - Contain actionable data (dates, locations, preferences, tiers)
   - Relevant to the stated goal

2. **Recommend Single-Field Personalizations:**
   - Example: "Use `given_name` for personalized greetings"
   - Example: "Use `next_trip_destination_city` to show destination imagery"
   - Example: "Use `sas_plcc_tier` to display tier-specific messaging"

3. **Recommend Compound Personalizations:**
   - Example: "Combine `days_until_next_flight` + `next_trip_destination_city` for countdown messaging"
   - Example: "Use `lifetime_revenue` + `is_eurobonus` to identify VIP treatment candidates"
   - Example: "Combine `most_frequent_destination` + `partner_brand_membership` for co-branded offers"

4. **Explain Reasoning:**
   - For each recommendation, explain WHY it's valuable
   - Reference the user's stated goal
   - Provide example personalized content

**Output Format:**
```json
{
  "recommendations": [
    {
      "id": "rec-001",
      "name": "Personalized Destination Hero",
      "fields_used": ["given_name", "next_trip_destination_city", "days_until_next_flight"],
      "strategy": "compound",
      "description": "Greet the customer by name with a countdown to their upcoming trip",
      "example_output": "Amy, your London adventure is just 45 days away!",
      "goal_alignment": "Directly supports booking conversions by creating excitement about upcoming travel",
      "confidence": "high"
    }
  ],
  "field_analysis": {
    "given_name": { "null_rate": 0, "personalization_value": "high", "use_cases": ["greeting", "subject lines"] },
    "next_trip_destination_city": { "null_rate": 0.2, "personalization_value": "high", "use_cases": ["imagery", "offers"] }
  }
}
```

**User Interaction:**
- Present recommendations as cards with approve/reject/modify options
- Allow user to select multiple recommendations to combine
- Allow user to request additional recommendations
- Allow user to manually specify fields if desired

#### FR-1.5: Asset Generation Step

**User Story:** As a marketer, I want the system to generate images and copy variations based on my selected personalization strategy.

**Process:**

1. **Copy Generation (Claude API):**
   - Generate 3-5 headline variations per personalization scenario
   - Generate 2-3 subheadline/body copy variations
   - Include dynamic placeholders: `{{given_name}}`, `{{next_trip_destination_city}}`, etc.
   - Tone should match brand guidelines (if provided) or default to professional/friendly

2. **Image Selection (Unsplash API):**
   - Search Unsplash for images matching personalization context
   - For location-based personalization: search destination keywords (e.g., "London skyline", "London travel")
   - For product-based personalization: search lifestyle/category keywords
   - Output: 5-8 image options per scenario for user selection
   - Request landscape orientation for hero banners
   - Use Unsplash's `w` and `h` parameters for optimized dimensions

3. **Fallback Content:**
   - Generate default/generic versions for anonymous users
   - Generate fallback for missing data scenarios
   - Select generic travel/lifestyle images for fallback scenarios

**Implementation Notes:**
- Unsplash API is free for production use (with attribution)
- Use `utm_source` parameter for Unsplash attribution compliance
- Claude API handles all copy generation (headlines, subheadlines, CTAs)

#### FR-1.6: Widget Configuration Step

**User Story:** As a marketer, I want to customize the widget's appearance and behavior before deployment.

**Configuration Options:**

| Option | Type | Values | Default |
|--------|------|--------|---------|
| Widget Type | enum | `hero_banner`, `inline_block` | `hero_banner` |
| Width | string | `100%`, `fixed-{px}` | `100%` |
| Height | string | `auto`, `fixed-{px}` | `auto` |
| Max Width | number (px) | 800-1920 | 1200 |
| Border Radius | number (px) | 0-24 | 8 |
| Background Color | color | hex/rgba | `#ffffff` |
| Text Color | color | hex/rgba | `#1a1a1a` |
| CTA Button Text | string | any | `Learn More` |
| CTA Button URL | string | URL with optional placeholders | `#` |
| Animation | enum | `none`, `fade`, `slide` | `fade` |
| Loading Behavior | enum | `skeleton`, `spinner`, `none` | `skeleton` |

#### FR-1.7: Snippet Generation & Export Step

**User Story:** As a marketer, I want to receive a deployable code snippet and preview my widget.

**Outputs:**

1. **JavaScript Snippet:**
```html
<!-- Amperity Personalization Widget -->
<div id="amp-widget-{config_id}"></div>
<script src="https://personalization.amperity.demo/widget.js?config={config_id}" async></script>
```

2. **Configuration Summary:**
   - Human-readable summary of all settings
   - List of data fields being used
   - Fallback behavior explanation

3. **Live Preview:**
   - Interactive preview showing widget with sample data
   - Toggle between different customer profiles
   - Toggle between personalized and fallback views

4. **Test Mode:**
   - Append `?amp_test=true&amp_email={email}` to preview with specific profile
   - Useful for QA before production deployment

---

### FR-2: Widget Runtime

The widget is a lightweight JavaScript bundle that renders on the customer's website.

#### FR-2.1: Initialization

**Script Load Behavior:**
1. Parse `config` parameter from script URL
2. Fetch widget configuration from Personalization Service
3. Attempt to identify user (see FR-2.2)
4. Fetch personalization data from Personalization Service
5. Render widget content

**Performance Requirements:**
- Script bundle: < 15KB gzipped
- Time to first render (skeleton): < 100ms
- Time to personalized content: < 500ms (excluding API latency)

#### FR-2.2: Identity Resolution

**MVP Implementation:**
```javascript
// Priority order for identity resolution
function resolveIdentity(config) {
  // 1. URL parameter override (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('amp_email')) return { type: 'email', value: urlParams.get('amp_email') };
  
  // 2. Data layer variable (configurable path)
  if (config.dataLayerPath && window[config.dataLayerPath]) {
    return { type: config.idType, value: getNestedValue(window, config.dataLayerPath) };
  }
  
  // 3. Explicit snippet configuration (hardcoded for demo)
  if (config.staticIdentity) {
    return { type: config.idType, value: config.staticIdentity };
  }
  
  // 4. No identity found
  return null;
}
```

**Future Enhancement (V2):**
- First-party cookie integration
- localStorage identity persistence
- Cross-domain identity resolution via Amperity ID Graph

#### FR-2.3: Rendering Engine

**Render Modes:**

1. **Progressive Enhancement (Default):**
   - Immediately render skeleton/placeholder
   - Fetch identity and API data in parallel
   - Swap to personalized content when ready
   - If identity unknown or API fails, render fallback content

2. **Pre-fetch (When Identity Known):**
   - If identity available on page load, fetch data immediately
   - Render personalized content as soon as available

**Content Injection:**
```javascript
// Widget renders inside its container
const container = document.getElementById(`amp-widget-${configId}`);

// Create shadow DOM for style isolation
const shadow = container.attachShadow({ mode: 'closed' });

// Inject styles and content
shadow.innerHTML = `
  <style>${widgetStyles}</style>
  <div class="amp-widget amp-widget--${config.type}">
    ${renderedContent}
  </div>
`;
```

#### FR-2.4: Fallback Handling

| Scenario | Behavior |
|----------|----------|
| No identity found | Render fallback/generic content |
| API returns 404 (unknown user) | Render fallback content |
| API returns error | Render fallback content, log error |
| API returns null for personalization field | Use fallback value for that field only |
| Network timeout (>3s) | Render fallback content |

---

### FR-3: Personalization Service API

Backend API routes that power both the wizard and widget runtime.

#### FR-3.1: Configuration Management

**POST /api/configs**
Create new personalization configuration.

Request:
```json
{
  "api_config": {
    "tenant_id": "acme-travel-hospitality",
    "api_endpoint": "apc-Tz8kHog3",
    "bearer_token": "encrypted_token_here",
    "id_type": "email"
  },
  "personalization": {
    "fields_used": ["given_name", "next_trip_destination_city", "days_until_next_flight"],
    "strategy": "compound",
    "copy_variants": [...],
    "image_urls": [...],
    "fallback_content": {...}
  },
  "widget_config": {
    "type": "hero_banner",
    "width": "100%",
    "max_width": 1200,
    ...
  }
}
```

Response:
```json
{
  "config_id": "cfg_abc123xyz",
  "snippet": "<div id=\"amp-widget-cfg_abc123xyz\"></div>\n<script src=\"...\" async></script>",
  "preview_url": "https://personalization.amperity.demo/preview/cfg_abc123xyz"
}
```

**GET /api/configs/:id**
Retrieve configuration (without sensitive credentials).

**PUT /api/configs/:id**
Update configuration.

**DELETE /api/configs/:id**
Delete configuration.

#### FR-3.2: Profile Proxy

**GET /api/profiles/:config_id/lookup**

This endpoint proxies requests to Amperity Profile API, keeping credentials server-side.

Query Parameters:
- `id_value` (required): The identifier value to look up

Process:
1. Retrieve config from database
2. Decrypt API credentials
3. Call Amperity Profile API
4. Return relevant fields only (as configured)

Response:
```json
{
  "personalization_data": {
    "given_name": "Amy",
    "next_trip_destination_city": "London",
    "days_until_next_flight": 45
  },
  "has_identity": true
}
```

#### FR-3.3: Widget Bundle

**GET /widget.js**

Query Parameters:
- `config` (required): Configuration ID

Returns:
- Minified JavaScript bundle
- Inlined configuration for performance
- CORS headers for cross-origin loading

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Widget JS bundle size | < 15KB gzipped | Build output |
| Time to skeleton render | < 100ms | Performance API |
| Time to personalized content | < 500ms (excluding API) | Performance API |
| Wizard page load | < 2s | Lighthouse |
| API proxy latency overhead | < 50ms | Server metrics |

### NFR-2: Security

| Requirement | Implementation |
|-------------|----------------|
| Credential storage | Encrypted at rest (Vercel KV encryption or manual AES-256) |
| API tokens in transit | HTTPS only, never exposed to client |
| CORS policy | Widget endpoint allows configured domains only |
| Rate limiting | 100 requests/minute per config_id |
| Input validation | Sanitize all user inputs, validate API responses |

**Migration Path to Production Security:**
- Replace environment-based encryption with KMS (AWS/GCP)
- Add OAuth 2.0 for wizard authentication
- Implement audit logging for credential access
- Add IP allowlisting for API proxy

### NFR-3: Reliability

| Requirement | Target |
|-------------|--------|
| Widget availability | 99.9% uptime |
| Graceful degradation | Always render fallback on error |
| Error logging | All errors logged with context |
| Retry logic | 1 retry with exponential backoff for API calls |

### NFR-4: Scalability (Future)

MVP targets demo/POC usage (< 100 configs, < 10K daily requests). Production scale considerations:
- Edge caching for widget bundles
- CDN distribution for generated assets
- Database sharding by tenant
- Async asset generation with job queue

---

## Data Models

### Configuration Schema

```typescript
interface PersonalizationConfig {
  id: string;                    // cfg_[a-z0-9]{12}
  created_at: Date;
  updated_at: Date;
  
  // API Configuration (encrypted fields marked)
  api_config: {
    tenant_id: string;
    api_endpoint: string;
    bearer_token: string;        // ENCRYPTED
    id_type: 'email' | 'amperity_id' | 'cookie_id' | 'maid' | 'custom';
    custom_id_field?: string;
  };
  
  // Personalization Strategy
  personalization: {
    goal: string;
    fields_used: string[];
    field_mappings: Record<string, FieldMapping>;
    copy_variants: CopyVariant[];
    image_assets: ImageAsset[];
    fallback_content: FallbackContent;
  };
  
  // Widget Appearance
  widget_config: {
    type: 'hero_banner' | 'inline_block';
    width: string;
    height: string;
    max_width: number;
    border_radius: number;
    background_color: string;
    text_color: string;
    cta_text: string;
    cta_url: string;
    animation: 'none' | 'fade' | 'slide';
    loading_behavior: 'skeleton' | 'spinner' | 'none';
  };
  
  // Identity Resolution
  identity_config: {
    data_layer_path?: string;    // e.g., "dataLayer.user.email"
    static_identity?: string;    // For demo/testing
    allowed_domains: string[];   // CORS allowlist
  };
}

interface FieldMapping {
  api_field: string;
  display_name: string;
  fallback_value: string;
  transform?: 'uppercase' | 'lowercase' | 'titlecase' | 'date_format';
  date_format?: string;
}

interface CopyVariant {
  id: string;
  headline: string;             // Supports {{field}} placeholders
  subheadline?: string;
  body?: string;
  conditions?: FieldCondition[]; // When to use this variant
}

interface ImageAsset {
  id: string;
  url: string;
  alt_text: string;
  conditions?: FieldCondition[];
}

interface FieldCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value?: any;
}

interface FallbackContent {
  headline: string;
  subheadline?: string;
  body?: string;
  image_url: string;
  image_alt: string;
}
```

---

## User Interface Specifications

### Wizard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Connect API                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Tenant ID: [acme-travel-hospitality        ]           │   │
│  │  API Endpoint: [apc-Tz8kHog3                ]           │   │
│  │  Bearer Token: [••••••••••••••••••          ]           │   │
│  │  ID Type: [Email ▼]                                     │   │
│  │                                                          │   │
│  │  [Test Connection]                                       │   │
│  │  ✓ Connected successfully! Found 47 profile fields.     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                              [Next →]           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Provide Sample Customers                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Enter 5-10 email addresses (one per line):             │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ awood712@estradamcdonald.com                    │   │   │
│  │  │ john.smith@example.com                          │   │   │
│  │  │ sarah.jones@acme.com                            │   │   │
│  │  │ ...                                             │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  [Analyze Profiles]                                      │   │
│  │  ✓ Retrieved 8/10 profiles. Analyzing data structure... │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                   [← Back]    [Next →]          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Define Your Goal                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  What do you want to achieve with personalization?      │   │
│  │                                                          │   │
│  │  Quick Start:                                            │   │
│  │  [Welcome returning customers] [Promote loyalty]         │   │
│  │  [Increase conversions] [Re-engage lapsed users]        │   │
│  │                                                          │   │
│  │  Or describe your goal:                                  │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ I want to create excitement about upcoming trips │   │   │
│  │  │ by showing customers their destination and a     │   │   │
│  │  │ countdown to their departure date.               │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                   [← Back]    [Next →]          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Step 4: AI Recommendations                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Based on your data and goal, here's what I recommend:  │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ ★ RECOMMENDED                                    │   │   │
│  │  │ Trip Countdown Hero                              │   │   │
│  │  │ Uses: given_name, next_trip_destination_city,   │   │   │
│  │  │       days_until_next_flight                     │   │   │
│  │  │                                                  │   │   │
│  │  │ "Amy, your London adventure is 45 days away!"   │   │   │
│  │  │                                                  │   │   │
│  │  │ Why: Creates urgency and excitement. All fields │   │   │
│  │  │ present in 80%+ of your profiles.               │   │   │
│  │  │                                     [Select ✓]  │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Loyalty Tier Recognition                         │   │   │
│  │  │ Uses: given_name, sas_plcc_tier, lifetime_revenue│   │   │
│  │  │ ...                                              │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  [+ Generate more recommendations]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                   [← Back]    [Next →]          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Generate Content                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Generating personalized content...                      │   │
│  │                                                          │   │
│  │  Headlines:                                              │   │
│  │  ○ "{{given_name}}, your {{destination}} adventure      │   │
│  │     is {{days}} days away!"                              │   │
│  │  ● "Ready for {{destination}}, {{given_name}}?          │   │
│  │     Just {{days}} days to go!"                          │   │
│  │  ○ "{{given_name}}, {{destination}} is calling—         │   │
│  │     {{days}} days until takeoff!"                       │   │
│  │                                                          │   │
│  │  Images:                                                 │   │
│  │  [London skyline] [London bridge] [UK countryside]      │   │
│  │       ✓ Selected                                        │   │
│  │                                                          │   │
│  │  Fallback (for unknown visitors):                       │   │
│  │  "Discover your next adventure with us"                 │   │
│  │  [Generic travel image]                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                   [← Back]    [Next →]          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Customize Widget                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Widget Type: [Hero Banner ▼]                           │   │
│  │  Width: [100%     ]  Max Width: [1200px]                │   │
│  │  Border Radius: [8px]                                   │   │
│  │  Background: [#1a365d]  Text: [#ffffff]                 │   │
│  │  CTA Text: [Book Now]  CTA URL: [/booking]              │   │
│  │  Animation: [Fade ▼]                                    │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │           LIVE PREVIEW                          │   │   │
│  │  │  ┌─────────────────────────────────────────┐   │   │   │
│  │  │  │ 🖼️ [London skyline image]                │   │   │   │
│  │  │  │                                          │   │   │   │
│  │  │  │ Ready for London, Amy?                   │   │   │   │
│  │  │  │ Just 45 days to go!                      │   │   │   │
│  │  │  │                                          │   │   │   │
│  │  │  │           [Book Now]                     │   │   │   │
│  │  │  └─────────────────────────────────────────┘   │   │   │
│  │  │                                                  │   │   │
│  │  │  Preview as: [Amy Wood ▼] [Anonymous User]      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                   [← Back]    [Generate →]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Deploy Your Widget                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🎉 Your personalization widget is ready!               │   │
│  │                                                          │   │
│  │  Add this snippet to your website:                       │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ <!-- Amperity Personalization Widget -->        │   │   │
│  │  │ <div id="amp-widget-cfg_abc123xyz"></div>       │   │   │
│  │  │ <script                                         │   │   │
│  │  │   src="https://personalization.amperity.demo    │   │   │
│  │  │        /widget.js?config=cfg_abc123xyz"         │   │   │
│  │  │   async></script>                               │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                        [Copy Snippet]   │   │
│  │                                                          │   │
│  │  Identity Setup (MVP):                                   │   │
│  │  For testing, add ?amp_email=user@example.com to URL    │   │
│  │                                                          │   │
│  │  For production, configure your data layer:             │   │
│  │  window.ampIdentity = { email: "user@example.com" };    │   │
│  │                                                          │   │
│  │  [Preview Widget] [Edit Configuration] [Create Another] │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Integration Specifications

### Copy Generation Prompt Template

```
You are a marketing copywriter specializing in website personalization. Generate compelling, concise copy for a personalization widget.

CONTEXT:
- Brand: {{brand_name}} (if provided, else "the brand")
- Industry: {{industry}} (inferred from data)
- Goal: {{user_goal}}
- Tone: Professional, warm, action-oriented

PERSONALIZATION FIELDS AVAILABLE:
{{#each fields}}
- {{name}}: {{description}} (sample value: {{sample}})
{{/each}}

REQUIREMENTS:
1. Generate 3 headline variations (max 60 characters each)
2. Generate 2 subheadline variations (max 100 characters each)
3. Use {{field_name}} syntax for dynamic placeholders
4. Ensure copy works grammatically with any field value
5. Create urgency or relevance without being pushy

OUTPUT FORMAT:
{
  "headlines": ["...", "...", "..."],
  "subheadlines": ["...", "..."],
  "cta_suggestions": ["...", "..."]
}
```

### Data Analysis Prompt Template

```
You are a personalization strategist analyzing customer data to recommend impactful website personalization strategies.

USER'S GOAL:
{{user_goal}}

AVAILABLE DATA FIELDS:
{{#each fields}}
- {{name}} ({{type}}): {{description}}
  - Sample values: {{samples}}
  - Null rate: {{null_rate}}%
{{/each}}

TASK:
Analyze the available data and recommend 3-5 personalization strategies that align with the user's goal. For each recommendation:

1. Name the strategy clearly
2. List the specific fields to use
3. Explain why this combination is valuable
4. Provide a concrete example of the personalized output
5. Note any data quality concerns (high null rates, etc.)
6. Rate confidence as high/medium/low

Prioritize:
- Strategies using fields with low null rates
- Compound strategies that combine multiple fields meaningfully
- Approaches that create emotional connection or urgency

OUTPUT FORMAT:
{
  "recommendations": [
    {
      "name": "...",
      "fields": ["...", "..."],
      "rationale": "...",
      "example_output": "...",
      "data_quality_notes": "...",
      "confidence": "high|medium|low"
    }
  ]
}
```

### Image Search Keywords Template (for Unsplash)

When searching for images, the system constructs keywords from personalization context:

**Location-Based Personalization:**
```
Primary: {{destination_city}} travel
Secondary: {{destination_city}} skyline, {{destination_city}} landmark
Fallback: {{destination_country}} travel, travel destination
```

**Loyalty/VIP Personalization:**
```
Primary: luxury travel, first class, premium experience
Secondary: business travel, airport lounge
```

**Re-engagement Personalization:**
```
Primary: adventure travel, wanderlust, explore
Secondary: vacation planning, dream destination
```

**Generic Fallback:**
```
travel adventure, airplane window, world map
```

**Unsplash API Parameters:**
- `orientation=landscape` for hero banners
- `w=1200&h=400` for optimized hero dimensions
- `w=600&h=300` for inline blocks
- Include `utm_source=amperity_personalization&utm_medium=referral` for attribution

---

## Implementation Phases

### Phase 1: MVP (Target: 2 weeks)

**Scope:**
- Wizard Steps 1-7 (full flow)
- Claude API for copy generation
- Unsplash API for image search/selection
- Hero banner widget only
- Email-based identity (URL parameter for demo)
- Vercel KV for config storage
- Basic error handling

**Deliverables:**
- Working wizard that creates configs
- AI-powered copy generation
- Curated image selection from Unsplash
- Deployable widget snippet
- Preview functionality
- Documentation

### Phase 2: Enhancement (Target: +1 week)

**Scope:**
- Smart data analysis recommendations (enhanced Claude prompts)
- Conditional content rules (show X when field Y equals Z)
- Multiple copy variants with A/B selection
- Image cropping/positioning controls

### Phase 3: Polish (Target: +1 week)

**Scope:**
- Inline content block widget type
- Advanced styling options
- Data layer identity integration
- Performance optimization
- Error logging and monitoring

### Phase 4: Production Readiness (Future)

**Scope:**
- OAuth authentication for wizard
- Multi-tenant support
- KMS integration for credential encryption
- CDN deployment for widget assets
- Analytics integration
- A/B testing capabilities

---

## Success Criteria

### Demo Success
- [ ] Complete wizard flow in < 5 minutes
- [ ] Widget renders correctly on any website
- [ ] Personalization visibly changes based on API data
- [ ] Fallback content displays for unknown users
- [ ] Non-technical user can complete setup without assistance

### Technical Success
- [ ] Widget bundle < 15KB
- [ ] No console errors in widget runtime
- [ ] API credentials never exposed to client
- [ ] Works in Chrome, Firefox, Safari, Edge

### Business Success
- [ ] Demonstrates clear Profile API value proposition
- [ ] Creates "wow moment" in prospect demos
- [ ] Reusable across multiple prospect scenarios
- [ ] Generates interest in production implementation

---

## Appendix A: Sample API Response Reference

```json
{
  "Flight_Search_Today": 0,
  "Latest_Search_Datetime": "2026-01-23T13:40:39.748Z",
  "amperity_id": null,
  "days_since_latest_activity": 200,
  "days_since_latest_booking": 130,
  "days_since_latest_upgrade": 199,
  "days_until_next_flight": 45,
  "email": "awood712@estradamcdonald.com",
  "flight_search_count": 3,
  "full_name": "Amy Wood",
  "given_name": "Amy",
  "is_eurobonus": true,
  "latest_booking_datetime": "2025-09-03T00:00:00.000Z",
  "latest_booking_subtotal": "780.00",
  "lifetime_preferred_booking_source": "direct",
  "lifetime_revenue": "7675.00",
  "lifetime_upgrades": 3,
  "most_frequent_destination": "OSL",
  "next_flight_date": {
    "date": "2026-02-25T05:00:00.000Z"
  },
  "next_trip_destination_city": "London",
  "next_trip_destination_country": "UK",
  "ontrip_status": "not onsite",
  "partner_brand_membership": "Starwood",
  "phone": "977.865.3303",
  "sas_plcc_tier": "Standard",
  "surname": "Wood",
  "total_pageviews": 9
}
```

### Field Analysis for Personalization

| Field | Type | Personalization Value | Use Cases |
|-------|------|----------------------|-----------|
| `given_name` | string | **High** | Greetings, subject lines |
| `next_trip_destination_city` | string | **High** | Hero imagery, destination content |
| `days_until_next_flight` | number | **High** | Countdown, urgency messaging |
| `is_eurobonus` | boolean | **Medium** | Loyalty tier messaging |
| `sas_plcc_tier` | string | **Medium** | Tier-specific benefits display |
| `lifetime_revenue` | string | **Medium** | VIP treatment triggers |
| `most_frequent_destination` | string | **Medium** | Recommendation personalization |
| `partner_brand_membership` | string | **Medium** | Co-branded offers |
| `days_since_latest_booking` | number | **Medium** | Re-engagement triggers |
| `ontrip_status` | string | **Low** | Real-time trip assistance |

---

## Appendix B: Environment Variables

```bash
# Vercel Environment Configuration

# Database
KV_REST_API_URL=           # Vercel KV endpoint
KV_REST_API_TOKEN=         # Vercel KV token

# Encryption (for MVP, use simple approach; upgrade for production)
ENCRYPTION_KEY=            # 32-byte hex string for AES-256

# AI Services
ANTHROPIC_API_KEY=         # For copy generation (Claude API)

# Unsplash (image search)
UNSPLASH_ACCESS_KEY=       # Get free key at unsplash.com/developers

# Application
NEXT_PUBLIC_APP_URL=       # e.g., https://amp-personalization.vercel.app
```

---

## Appendix C: File Structure

```
amperity-personalization-agent/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # Landing/dashboard
│   ├── wizard/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Wizard entry
│   │   ├── [step]/
│   │   │   └── page.tsx          # Dynamic step pages
│   │   └── components/
│   │       ├── StepIndicator.tsx
│   │       ├── ApiConfigForm.tsx
│   │       ├── SampleDataForm.tsx
│   │       ├── GoalInput.tsx
│   │       ├── RecommendationCards.tsx
│   │       ├── ContentGenerator.tsx
│   │       ├── WidgetConfigurator.tsx
│   │       └── SnippetOutput.tsx
│   ├── preview/
│   │   └── [configId]/
│   │       └── page.tsx          # Widget preview page
│   └── api/
│       ├── configs/
│       │   ├── route.ts          # POST: create config
│       │   └── [id]/
│       │       └── route.ts      # GET, PUT, DELETE
│       ├── profiles/
│       │   └── [configId]/
│       │       └── lookup/
│       │           └── route.ts  # Profile proxy
│       ├── analyze/
│       │   └── route.ts          # AI data analysis
│       ├── generate/
│       │   ├── copy/
│       │   │   └── route.ts      # AI copy generation
│       │   └── images/
│       │       └── route.ts      # AI/Unsplash images
│       └── widget/
│           └── route.ts          # Widget JS bundle
├── lib/
│   ├── amperity.ts               # Amperity API client
│   ├── encryption.ts             # Credential encryption
│   ├── db.ts                     # Vercel KV operations
│   ├── ai/
│   │   ├── claude.ts             # Claude API wrapper
│   │   ├── unsplash.ts           # Unsplash image search
│   │   └── prompts.ts            # Prompt templates
│   └── widget/
│       ├── builder.ts            # Widget code generator
│       └── templates/
│           ├── hero.ts
│           └── inline.ts
├── widget/                       # Standalone widget source
│   ├── src/
│   │   ├── index.ts              # Widget entry point
│   │   ├── identity.ts           # Identity resolution
│   │   ├── renderer.ts           # Content rendering
│   │   └── styles.ts             # Inline styles
│   ├── rollup.config.js          # Bundle configuration
│   └── package.json
├── public/
│   └── widget.js                 # Built widget bundle
├── types/
│   └── index.ts                  # TypeScript definitions
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Appendix D: Claude Code Execution Notes

When implementing this PRD with Claude Code:

1. **Start with the data models** - Create TypeScript interfaces first to establish the contract
2. **Build API routes before UI** - Ensure backend works before wiring up frontend
3. **Use incremental testing** - Test each wizard step independently
4. **Widget should be built separately** - Use Rollup/esbuild for minimal bundle
5. **Encrypt credentials immediately** - Even in MVP, don't store plaintext tokens
6. **Add comprehensive error handling** - Every API call should have try/catch with user-friendly messages

**Recommended Implementation Order:**
1. Database schema and Vercel KV setup
2. Encryption utilities
3. Config CRUD API routes
4. Amperity API proxy
5. Wizard UI (steps 1-2)
6. Widget renderer (basic)
7. Wizard UI (steps 3-4)
8. AI integration
9. Wizard UI (steps 5-7)
10. Widget polish and optimization
