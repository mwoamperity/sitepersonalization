'use client';

import { useState, useEffect } from 'react';
import type { PersonalizationRecommendation, AnalysisResult } from '@/types';

interface RecommendationCardsProps {
  profiles: Record<string, unknown>[];
  goal: string;
  onSelect: (recommendation: PersonalizationRecommendation, analysis: AnalysisResult) => void;
  onBack: () => void;
}

export default function RecommendationCards({ profiles, goal, onSelect, onBack }: RecommendationCardsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function analyze() {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profiles, goal }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze data');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    }

    analyze();
  }, [profiles, goal]);

  const handleContinue = () => {
    if (analysis && selected) {
      const recommendation = analysis.recommendations.find((r) => r.id === selected);
      if (recommendation) {
        onSelect(recommendation, analysis);
      }
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amperity-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your data and generating recommendations...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <h4 className="font-medium">Analysis Failed</h4>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <div className="mt-6">
          <button onClick={onBack} className="btn btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
      <p className="text-gray-600 mb-6">
        Based on your data and goal, here are our recommended personalization strategies. Select one to continue.
      </p>

      <div className="space-y-4">
        {analysis?.recommendations.map((rec, index) => (
          <div
            key={rec.id}
            onClick={() => setSelected(rec.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selected === rec.id
                ? 'border-amperity-blue bg-amperity-blue/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      RECOMMENDED
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    rec.confidence === 'high'
                      ? 'bg-green-100 text-green-800'
                      : rec.confidence === 'medium'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.confidence.toUpperCase()} CONFIDENCE
                  </span>
                </div>
                <h4 className="font-semibold text-lg">{rec.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>

                {/* Fields Used */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Uses fields:</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.fields_used.map((field) => (
                      <span
                        key={field}
                        className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Example Output */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Example output:</p>
                  <p className="text-sm font-medium text-gray-800">&ldquo;{rec.example_output}&rdquo;</p>
                </div>

                {/* Goal Alignment */}
                <p className="text-sm text-gray-600 mt-3">
                  <span className="font-medium">Why this works:</span> {rec.goal_alignment}
                </p>
              </div>

              {/* Selection Indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                selected === rec.id
                  ? 'border-amperity-blue bg-amperity-blue'
                  : 'border-gray-300'
              }`}>
                {selected === rec.id && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="btn btn-primary"
        >
          Continue with Selected
        </button>
      </div>
    </div>
  );
}
