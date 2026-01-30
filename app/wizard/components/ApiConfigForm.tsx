'use client';

import { useState } from 'react';
import type { ApiConfig, IdType } from '@/types';

interface ApiConfigFormProps {
  initialConfig: Partial<ApiConfig>;
  onComplete: (config: ApiConfig, profiles: Record<string, unknown>[]) => void;
}

const ID_TYPES: { value: IdType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'amperity_id', label: 'Amperity ID' },
  { value: 'cookie_id', label: 'Cookie ID' },
  { value: 'maid', label: 'Mobile Ad ID (MAID)' },
  { value: 'custom', label: 'Custom Field' },
];

export default function ApiConfigForm({ initialConfig, onComplete }: ApiConfigFormProps) {
  const [config, setConfig] = useState<Partial<ApiConfig>>({
    tenant_id: initialConfig.tenant_id || '',
    api_endpoint: initialConfig.api_endpoint || '',
    bearer_token: initialConfig.bearer_token || '',
    id_type: initialConfig.id_type || 'email',
    custom_id_field: initialConfig.custom_id_field || '',
  });

  const [testValue, setTestValue] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    fieldCount?: number;
  } | null>(null);

  const handleChange = (field: keyof ApiConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!config.tenant_id || !config.api_endpoint || !config.bearer_token || !testValue) {
      setTestResult({ success: false, message: 'Please fill in all fields and provide a test value.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/profiles/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          test_value: testValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: `Connected successfully! Found ${data.field_count} profile fields.`,
          fieldCount: data.field_count,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Please check your credentials.',
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Network error. Please check your connection.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = () => {
    if (testResult?.success) {
      onComplete(config as ApiConfig, []);
    }
  };

  const isValid = config.tenant_id && config.api_endpoint && config.bearer_token && testResult?.success;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-6">Connect to Amperity Profile API</h3>

      <div className="space-y-4">
        {/* Tenant ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tenant ID
          </label>
          <input
            type="text"
            value={config.tenant_id}
            onChange={(e) => handleChange('tenant_id', e.target.value)}
            placeholder="e.g., acme-travel-hospitality"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Amperity tenant identifier
          </p>
        </div>

        {/* API Endpoint */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Endpoint ID
          </label>
          <input
            type="text"
            value={config.api_endpoint}
            onChange={(e) => handleChange('api_endpoint', e.target.value)}
            placeholder="e.g., apc-Tz8kHog3"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            The Profile API endpoint identifier
          </p>
        </div>

        {/* Bearer Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bearer Token
          </label>
          <input
            type="password"
            value={config.bearer_token}
            onChange={(e) => handleChange('bearer_token', e.target.value)}
            placeholder="Enter your API token"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API authentication token (stored encrypted)
          </p>
        </div>

        {/* ID Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Identity Type
          </label>
          <select
            value={config.id_type}
            onChange={(e) => handleChange('id_type', e.target.value as IdType)}
            className="w-full"
          >
            {ID_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom ID Field (conditional) */}
        {config.id_type === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom ID Field Name
            </label>
            <input
              type="text"
              value={config.custom_id_field}
              onChange={(e) => handleChange('custom_id_field', e.target.value)}
              placeholder="e.g., customer_id"
              className="w-full"
            />
          </div>
        )}

        {/* Test Connection */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test with a sample {config.id_type === 'email' ? 'email' : 'ID'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder={config.id_type === 'email' ? 'user@example.com' : 'Enter test ID'}
              className="flex-1"
            />
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="btn btn-secondary whitespace-nowrap"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-4 rounded-lg ${
              testResult.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>{testResult.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
