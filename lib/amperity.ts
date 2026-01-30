// Amperity Profile API Client
// Handles communication with the Amperity Profile API

import type { IdType, ProfileLookupResponse, TestConnectionResponse } from '@/types';

export interface AmperityClientConfig {
  tenant_id: string;
  api_endpoint: string;
  bearer_token: string;
  id_type: IdType;
  custom_id_field?: string;
}

/**
 * Build the Amperity API base URL
 */
function buildBaseUrl(tenantId: string): string {
  return `https://${tenantId}.amperity.com`;
}

/**
 * Build the profile lookup URL
 */
function buildLookupUrl(
  config: AmperityClientConfig,
  idValue: string
): string {
  const baseUrl = buildBaseUrl(config.tenant_id);
  const idField = config.id_type === 'custom'
    ? config.custom_id_field
    : config.id_type;

  return `${baseUrl}/prof/profiles/${config.api_endpoint}/lookup?${idField}=${encodeURIComponent(idValue)}`;
}

/**
 * Create request headers for Amperity API calls
 */
function createHeaders(config: AmperityClientConfig): HeadersInit {
  return {
    'Amperity-Tenant': config.tenant_id,
    'Authorization': `Bearer ${config.bearer_token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Test connection to Amperity Profile API
 */
export async function testConnection(
  config: AmperityClientConfig,
  testValue: string
): Promise<TestConnectionResponse> {
  try {
    const url = buildLookupUrl(config, testValue);
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(config),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication failed. Please check your bearer token.',
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: 'API endpoint not found. Please check your tenant ID and endpoint.',
        };
      }
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const fields = Object.keys(data);

    return {
      success: true,
      field_count: fields.length,
      sample_fields: fields.slice(0, 10),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Connection failed: ${message}`,
    };
  }
}

/**
 * Look up a customer profile by ID
 */
export async function lookupProfile(
  config: AmperityClientConfig,
  idValue: string
): Promise<Record<string, unknown> | null> {
  try {
    const url = buildLookupUrl(config, idValue);
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(config),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Profile not found
      }
      throw new Error(`API returned status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Profile lookup failed:', error);
    throw error;
  }
}

/**
 * Look up multiple profiles in parallel
 */
export async function lookupProfiles(
  config: AmperityClientConfig,
  idValues: string[]
): Promise<Array<{ id: string; profile: Record<string, unknown> | null }>> {
  const results = await Promise.allSettled(
    idValues.map(async (id) => ({
      id,
      profile: await lookupProfile(config, id),
    }))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return { id: idValues[index], profile: null };
  });
}

/**
 * Extract personalization data from a profile
 * Only returns the fields configured for personalization
 */
export function extractPersonalizationData(
  profile: Record<string, unknown> | null,
  fieldsUsed: string[]
): ProfileLookupResponse {
  if (!profile) {
    return {
      personalization_data: {},
      has_identity: false,
    };
  }

  const personalizationData: Record<string, unknown> = {};

  for (const field of fieldsUsed) {
    if (field in profile) {
      personalizationData[field] = profile[field];
    }
  }

  return {
    personalization_data: personalizationData,
    has_identity: true,
  };
}

/**
 * Analyze profiles to determine field statistics
 */
export function analyzeProfileFields(
  profiles: Array<Record<string, unknown> | null>
): Record<string, {
  null_rate: number;
  data_type: string;
  sample_values: unknown[];
}> {
  const validProfiles = profiles.filter((p): p is Record<string, unknown> => p !== null);

  if (validProfiles.length === 0) {
    return {};
  }

  // Get all unique fields across all profiles
  const allFields = new Set<string>();
  for (const profile of validProfiles) {
    for (const field of Object.keys(profile)) {
      allFields.add(field);
    }
  }

  const analysis: Record<string, {
    null_rate: number;
    data_type: string;
    sample_values: unknown[];
  }> = {};

  for (const field of allFields) {
    const values = validProfiles.map((p) => p[field]);
    const nullCount = values.filter((v) => v === null || v === undefined).length;
    const nonNullValues = values.filter((v) => v !== null && v !== undefined);

    // Determine data type from first non-null value
    let dataType = 'unknown';
    if (nonNullValues.length > 0) {
      const sample = nonNullValues[0];
      if (typeof sample === 'string') {
        // Check if it looks like a date
        if (/^\d{4}-\d{2}-\d{2}/.test(sample)) {
          dataType = 'date';
        } else {
          dataType = 'string';
        }
      } else if (typeof sample === 'number') {
        dataType = 'number';
      } else if (typeof sample === 'boolean') {
        dataType = 'boolean';
      } else if (Array.isArray(sample)) {
        dataType = 'array';
      } else if (typeof sample === 'object') {
        dataType = 'object';
      }
    }

    analysis[field] = {
      null_rate: nullCount / validProfiles.length,
      data_type: dataType,
      sample_values: nonNullValues.slice(0, 3),
    };
  }

  return analysis;
}
