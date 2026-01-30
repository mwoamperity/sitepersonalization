'use client';

import { useState } from 'react';

interface GoalInputProps {
  initialGoal: string;
  onComplete: (goal: string) => void;
  onBack: () => void;
}

const GOAL_TEMPLATES = [
  { id: 'welcome', label: 'Welcome returning customers', icon: '👋' },
  { id: 'loyalty', label: 'Promote loyalty program', icon: '⭐' },
  { id: 'conversion', label: 'Increase conversions', icon: '📈' },
  { id: 'cart', label: 'Reduce cart abandonment', icon: '🛒' },
  { id: 'crosssell', label: 'Cross-sell products', icon: '🎁' },
  { id: 'reengage', label: 'Re-engage lapsed customers', icon: '🔄' },
];

const GOAL_EXAMPLES: Record<string, string> = {
  welcome: 'I want to welcome returning customers by name and show them relevant offers based on their recent activity.',
  loyalty: 'I want to recognize loyalty program members, display their tier status, and highlight exclusive benefits.',
  conversion: 'I want to create excitement about upcoming trips by showing destination imagery and countdown messaging.',
  cart: 'I want to remind customers about items in their cart and offer incentives to complete their purchase.',
  crosssell: 'I want to recommend complementary products based on past purchases and browsing behavior.',
  reengage: 'I want to win back customers who haven\'t purchased recently with personalized offers based on their preferences.',
};

export default function GoalInput({ initialGoal, onComplete, onBack }: GoalInputProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setGoal(GOAL_EXAMPLES[templateId]);
  };

  const handleContinue = () => {
    if (goal.trim().length >= 20) {
      onComplete(goal.trim());
    }
  };

  const isValid = goal.trim().length >= 20;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Define Your Personalization Goal</h3>
      <p className="text-gray-600 mb-6">
        Tell us what you want to achieve. This helps our AI recommend the best data points and content strategies.
      </p>

      <div className="space-y-6">
        {/* Quick Start Templates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Start (click to use as starting point)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GOAL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-amperity-blue bg-amperity-blue/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl mb-1 block">{template.icon}</span>
                <span className="text-sm font-medium">{template.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Goal Text Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe your personalization goal
          </label>
          <textarea
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              setSelectedTemplate(null);
            }}
            placeholder="Example: I want to show personalized destination recommendations to encourage flight bookings based on the customer's travel history and upcoming trips."
            rows={4}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Be specific about what you want to achieve and who your target audience is.
            </p>
            <p className={`text-xs ${goal.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
              {goal.length}/500 (min 20)
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Tips for a great goal</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be specific about the action you want customers to take</li>
            <li>• Mention specific data points if you know them (e.g., &quot;destination city&quot;, &quot;loyalty tier&quot;)</li>
            <li>• Describe the emotional response you want to create</li>
            <li>• Consider both identified and anonymous visitor experiences</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="btn btn-primary"
        >
          Analyze & Get Recommendations
        </button>
      </div>
    </div>
  );
}
