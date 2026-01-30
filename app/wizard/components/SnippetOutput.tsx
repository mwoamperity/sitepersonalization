'use client';

import { useState } from 'react';
import type { WizardState } from '@/types';

interface SnippetOutputProps {
  wizardState: WizardState;
  configId: string | null;
  onDeploy: (configId: string) => void;
  onBack: () => void;
}

export default function SnippetOutput({ wizardState, configId, onDeploy, onBack }: SnippetOutputProps) {
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);

    try {
      const response = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_config: wizardState.api_config,
          personalization: {
            goal: wizardState.goal,
            fields_used: wizardState.selected_recommendation?.fields_used || [],
            field_mappings: {},
            copy_variants: wizardState.copy_variants,
            image_assets: wizardState.selected_images,
            fallback_content: wizardState.fallback_content,
          },
          widget_config: wizardState.widget_config,
          identity_config: {
            allowed_domains: ['*'],
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create configuration');
      }

      const data = await response.json();
      onDeploy(data.config_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const getSnippet = () => {
    if (!configId) return '';
    return `<!-- Amperity Personalization Widget -->
<div id="amp-widget-${configId}"></div>
<script src="${appUrl}/api/widget?config=${configId}" async></script>`;
  };

  const handleCopy = async () => {
    const snippet = getSnippet();
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        {configId ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Your Widget is Ready!</h3>
            <p className="text-gray-600 mt-2">Add the snippet below to your website to start personalizing.</p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-2">Deploy Your Widget</h3>
            <p className="text-gray-600">Review your configuration and deploy to get your embed code.</p>
          </>
        )}
      </div>

      {!configId ? (
        <div className="space-y-6">
          {/* Configuration Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Configuration Summary</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Goal:</dt>
                <dd className="font-medium">{wizardState.goal.substring(0, 50)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Strategy:</dt>
                <dd className="font-medium">{wizardState.selected_recommendation?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Widget Type:</dt>
                <dd className="font-medium capitalize">{wizardState.widget_config.type?.replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Fields Used:</dt>
                <dd className="font-medium">{wizardState.selected_recommendation?.fields_used.join(', ')}</dd>
              </div>
            </dl>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
              {error}
            </div>
          )}

          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="btn btn-success w-full py-3"
          >
            {deploying ? 'Deploying...' : 'Deploy Configuration'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Embed Snippet</label>
              <button
                onClick={handleCopy}
                className="text-sm text-amperity-blue hover:text-amperity-blue/80"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <pre className="code-block text-sm overflow-x-auto">
              {getSnippet()}
            </pre>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Installation Instructions</h4>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Copy the snippet above</li>
              <li>Paste it into your website HTML where you want the widget to appear</li>
              <li>For testing, add <code className="bg-blue-100 px-1 rounded">?amp_email=test@example.com</code> to your URL</li>
              <li>For production, configure identity resolution via your data layer</li>
            </ol>
          </div>

          {/* Identity Setup */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-3">Identity Configuration</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">For testing (URL parameter):</p>
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  ?amp_email=user@example.com
                </code>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">For production (JavaScript):</p>
                <pre className="code-block text-sm">
{`window.ampIdentity = {
  email: "user@example.com"
};`}
                </pre>
              </div>
            </div>
          </div>

          {/* Preview Link */}
          <div className="flex gap-3">
            <a
              href={`${appUrl}/preview/${configId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex-1 text-center"
            >
              Preview Widget
            </a>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary flex-1"
            >
              Create Another
            </button>
          </div>
        </div>
      )}

      {/* Back Button (only before deploy) */}
      {!configId && (
        <div className="mt-6">
          <button onClick={onBack} className="btn btn-secondary">
            Back
          </button>
        </div>
      )}
    </div>
  );
}
