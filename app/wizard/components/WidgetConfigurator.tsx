'use client';

import { useState } from 'react';
import type { WidgetConfig, CopyVariant, ImageAsset, FallbackContent } from '@/types';

interface WidgetConfiguratorProps {
  initialConfig: WidgetConfig;
  copyVariants: CopyVariant[];
  images: ImageAsset[];
  fallbackContent: FallbackContent;
  sampleProfile: Record<string, unknown>;
  onComplete: (config: WidgetConfig) => void;
  onBack: () => void;
}

export default function WidgetConfigurator({
  initialConfig,
  copyVariants,
  images,
  fallbackContent,
  sampleProfile,
  onComplete,
  onBack,
}: WidgetConfiguratorProps) {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [previewMode, setPreviewMode] = useState<'personalized' | 'fallback'>('personalized');

  const updateConfig = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const replacePlaceholders = (text: string, data: Record<string, unknown>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, field) => {
      return data[field] !== undefined && data[field] !== null ? String(data[field]) : '';
    });
  };

  const getPreviewContent = () => {
    if (previewMode === 'fallback') {
      return {
        headline: fallbackContent.headline,
        subheadline: fallbackContent.subheadline,
        imageUrl: fallbackContent.image_url,
      };
    }

    const variant = copyVariants[0];
    return {
      headline: replacePlaceholders(variant?.headline || '', sampleProfile),
      subheadline: variant?.subheadline ? replacePlaceholders(variant.subheadline, sampleProfile) : '',
      imageUrl: images[0]?.url || fallbackContent.image_url,
    };
  };

  const preview = getPreviewContent();

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Customize Widget</h3>
      <p className="text-gray-600 mb-6">
        Configure the appearance of your personalization widget.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Widget Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Widget Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateConfig('type', 'hero_banner')}
                className={`p-3 rounded-lg border-2 text-left ${
                  config.type === 'hero_banner'
                    ? 'border-amperity-blue bg-amperity-blue/5'
                    : 'border-gray-200'
                }`}
              >
                <span className="font-medium block">Hero Banner</span>
                <span className="text-xs text-gray-500">Full-width with background image</span>
              </button>
              <button
                onClick={() => updateConfig('type', 'inline_block')}
                className={`p-3 rounded-lg border-2 text-left ${
                  config.type === 'inline_block'
                    ? 'border-amperity-blue bg-amperity-blue/5'
                    : 'border-gray-200'
                }`}
              >
                <span className="font-medium block">Inline Block</span>
                <span className="text-xs text-gray-500">Compact card style</span>
              </button>
            </div>
          </div>

          {/* Max Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Width: {config.max_width}px
            </label>
            <input
              type="range"
              min={600}
              max={1920}
              step={20}
              value={config.max_width}
              onChange={(e) => updateConfig('max_width', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Radius: {config.border_radius}px
            </label>
            <input
              type="range"
              min={0}
              max={24}
              value={config.border_radius}
              onChange={(e) => updateConfig('border_radius', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.background_color}
                  onChange={(e) => updateConfig('background_color', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.background_color}
                  onChange={(e) => updateConfig('background_color', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.text_color}
                  onChange={(e) => updateConfig('text_color', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.text_color}
                  onChange={(e) => updateConfig('text_color', e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
              <input
                type="text"
                value={config.cta_text}
                onChange={(e) => updateConfig('cta_text', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
              <input
                type="text"
                value={config.cta_url}
                onChange={(e) => updateConfig('cta_url', e.target.value)}
                placeholder="/booking"
                className="w-full"
              />
            </div>
          </div>

          {/* Animation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animation</label>
            <select
              value={config.animation}
              onChange={(e) => updateConfig('animation', e.target.value as WidgetConfig['animation'])}
              className="w-full"
            >
              <option value="none">None</option>
              <option value="fade">Fade In</option>
              <option value="slide">Slide Up</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">Live Preview</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('personalized')}
                className={`px-3 py-1 text-sm rounded ${
                  previewMode === 'personalized'
                    ? 'bg-amperity-blue text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Personalized
              </button>
              <button
                onClick={() => setPreviewMode('fallback')}
                className={`px-3 py-1 text-sm rounded ${
                  previewMode === 'fallback'
                    ? 'bg-amperity-blue text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Fallback
              </button>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <div
              style={{
                maxWidth: config.max_width,
                borderRadius: config.border_radius,
                backgroundColor: config.background_color,
                color: config.text_color,
                overflow: 'hidden',
              }}
              className="mx-auto shadow-lg"
            >
              {config.type === 'hero_banner' && preview.imageUrl && (
                <div className="relative">
                  <img
                    src={preview.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 p-6"
                    style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    }}
                  >
                    <h2 className="text-2xl font-bold text-white">{preview.headline}</h2>
                    {preview.subheadline && (
                      <p className="text-white/90 mt-1">{preview.subheadline}</p>
                    )}
                    <button
                      className="mt-4 px-6 py-2 bg-white text-black font-semibold rounded"
                    >
                      {config.cta_text}
                    </button>
                  </div>
                </div>
              )}

              {config.type === 'inline_block' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold">{preview.headline}</h2>
                  {preview.subheadline && (
                    <p className="mt-2 opacity-80">{preview.subheadline}</p>
                  )}
                  <button
                    className="mt-4 px-6 py-2 rounded font-semibold"
                    style={{
                      backgroundColor: config.text_color,
                      color: config.background_color,
                    }}
                  >
                    {config.cta_text}
                  </button>
                </div>
              )}
            </div>
          </div>

          {previewMode === 'personalized' && sampleProfile && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Previewing with: {sampleProfile.given_name ? String(sampleProfile.given_name) : 'Sample User'}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button onClick={() => onComplete(config)} className="btn btn-primary">
          Generate Snippet
        </button>
      </div>
    </div>
  );
}
