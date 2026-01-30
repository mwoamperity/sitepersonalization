'use client';

import { useState } from 'react';
import type { ApiConfig } from '@/types';

interface SampleDataFormProps {
  apiConfig: ApiConfig;
  initialIds: string[];
  onComplete: (ids: string[], profiles: Record<string, unknown>[]) => void;
  onBack: () => void;
}

export default function SampleDataForm({ apiConfig, initialIds, onComplete, onBack }: SampleDataFormProps) {
  const [idsText, setIdsText] = useState(initialIds.join('\n'));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    found: number;
    profiles: Record<string, unknown>[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseIds = (text: string): string[] => {
    return text
      .split(/[\n,]/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  };

  const handleAnalyze = async () => {
    const ids = parseIds(idsText);

    if (ids.length < 3) {
      setError('Please provide at least 3 sample IDs for meaningful analysis.');
      return;
    }

    if (ids.length > 15) {
      setError('Please provide no more than 15 sample IDs.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/profiles/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_config: apiConfig,
          ids,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profiles');
      }

      setResult({
        total: ids.length,
        found: data.profiles.filter((p: Record<string, unknown> | null) => p !== null).length,
        profiles: data.profiles.filter((p: Record<string, unknown> | null) => p !== null),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (result && result.profiles.length > 0) {
      onComplete(parseIds(idsText), result.profiles);
    }
  };

  const idType = apiConfig.id_type === 'email' ? 'email addresses' : 'IDs';

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Provide Sample Customers</h3>
      <p className="text-gray-600 mb-6">
        Enter 5-10 sample {idType} so we can analyze your data structure and recommend personalization strategies.
      </p>

      <div className="space-y-4">
        {/* IDs Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sample {apiConfig.id_type === 'email' ? 'Email Addresses' : 'IDs'} (one per line or comma-separated)
          </label>
          <textarea
            value={idsText}
            onChange={(e) => {
              setIdsText(e.target.value);
              setResult(null);
            }}
            placeholder={
              apiConfig.id_type === 'email'
                ? 'john.smith@example.com\njane.doe@example.com\nalex.jones@example.com'
                : 'id_12345\nid_67890\nid_11111'
            }
            rows={8}
            className="w-full font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            {parseIds(idsText).length} {parseIds(idsText).length === 1 ? 'ID' : 'IDs'} entered
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || parseIds(idsText).length < 3}
          className="btn btn-secondary"
        >
          {loading ? 'Analyzing Profiles...' : 'Analyze Profiles'}
        </button>

        {/* Result */}
        {result && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Retrieved {result.found}/{result.total} profiles
            </div>
            <p className="text-sm text-green-700 mt-2">
              Analyzing data structure...
            </p>

            {/* Field Preview */}
            {result.profiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Discovered {Object.keys(result.profiles[0]).length} fields:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(result.profiles[0]).slice(0, 12).map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-white rounded text-xs font-mono text-gray-600 border border-gray-200"
                    >
                      {field}
                    </span>
                  ))}
                  {Object.keys(result.profiles[0]).length > 12 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{Object.keys(result.profiles[0]).length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!result || result.profiles.length === 0}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
