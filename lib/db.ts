// Database Operations using Vercel KV
// Handles CRUD operations for personalization configurations

import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import type { PersonalizationConfig, ApiConfig } from '@/types';
import { encrypt, decrypt } from './encryption';

const CONFIG_PREFIX = 'config:';
const CONFIG_LIST_KEY = 'config:list';

/**
 * Generate a new configuration ID
 */
function generateConfigId(): string {
  const uuid = uuidv4().replace(/-/g, '');
  return `cfg_${uuid.substring(0, 12)}`;
}

/**
 * Encrypt sensitive fields in API config before storage
 */
function encryptApiConfig(apiConfig: ApiConfig): ApiConfig {
  return {
    ...apiConfig,
    bearer_token: encrypt(apiConfig.bearer_token),
  };
}

/**
 * Decrypt sensitive fields in API config after retrieval
 */
function decryptApiConfig(apiConfig: ApiConfig): ApiConfig {
  return {
    ...apiConfig,
    bearer_token: decrypt(apiConfig.bearer_token),
  };
}

/**
 * Create a new personalization configuration
 */
export async function createConfig(
  config: Omit<PersonalizationConfig, 'id' | 'created_at' | 'updated_at'>
): Promise<PersonalizationConfig> {
  const id = generateConfigId();
  const now = new Date().toISOString();

  const fullConfig: PersonalizationConfig = {
    ...config,
    id,
    created_at: now,
    updated_at: now,
    api_config: encryptApiConfig(config.api_config),
  };

  // Store the config
  await kv.set(`${CONFIG_PREFIX}${id}`, fullConfig);

  // Add to the list of configs
  await kv.sadd(CONFIG_LIST_KEY, id);

  return {
    ...fullConfig,
    api_config: config.api_config, // Return with unencrypted token
  };
}

/**
 * Get a configuration by ID
 * @param includeCredentials - If true, decrypt and include bearer token
 */
export async function getConfig(
  id: string,
  includeCredentials = false
): Promise<PersonalizationConfig | null> {
  const config = await kv.get<PersonalizationConfig>(`${CONFIG_PREFIX}${id}`);

  if (!config) {
    return null;
  }

  if (includeCredentials) {
    return {
      ...config,
      api_config: decryptApiConfig(config.api_config),
    };
  }

  // Return without bearer token for non-sensitive requests
  return {
    ...config,
    api_config: {
      ...config.api_config,
      bearer_token: '[REDACTED]',
    },
  };
}

/**
 * Update a configuration
 */
export async function updateConfig(
  id: string,
  updates: Partial<Omit<PersonalizationConfig, 'id' | 'created_at'>>
): Promise<PersonalizationConfig | null> {
  const existing = await kv.get<PersonalizationConfig>(`${CONFIG_PREFIX}${id}`);

  if (!existing) {
    return null;
  }

  const updated: PersonalizationConfig = {
    ...existing,
    ...updates,
    id, // Ensure ID cannot be changed
    created_at: existing.created_at, // Preserve creation time
    updated_at: new Date().toISOString(),
  };

  // Re-encrypt API config if it was updated
  if (updates.api_config) {
    updated.api_config = encryptApiConfig(updates.api_config);
  }

  await kv.set(`${CONFIG_PREFIX}${id}`, updated);

  return {
    ...updated,
    api_config: updates.api_config
      ? updates.api_config
      : { ...existing.api_config, bearer_token: '[REDACTED]' },
  };
}

/**
 * Delete a configuration
 */
export async function deleteConfig(id: string): Promise<boolean> {
  const existing = await kv.get<PersonalizationConfig>(`${CONFIG_PREFIX}${id}`);

  if (!existing) {
    return false;
  }

  await kv.del(`${CONFIG_PREFIX}${id}`);
  await kv.srem(CONFIG_LIST_KEY, id);

  return true;
}

/**
 * List all configuration IDs
 */
export async function listConfigIds(): Promise<string[]> {
  const ids = await kv.smembers(CONFIG_LIST_KEY);
  return ids as string[];
}

/**
 * List all configurations (without credentials)
 */
export async function listConfigs(): Promise<PersonalizationConfig[]> {
  const ids = await listConfigIds();
  const configs = await Promise.all(
    ids.map((id) => getConfig(id, false))
  );
  return configs.filter((c): c is PersonalizationConfig => c !== null);
}
