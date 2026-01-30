'use client';

import { useState, useEffect } from 'react';
import type { PersonalizationRecommendation, CopyVariant, ImageAsset, FallbackContent, UnsplashImage } from '@/types';

interface ContentGeneratorProps {
  recommendation: PersonalizationRecommendation;
  profiles: Record<string, unknown>[];
  goal: string;
  onComplete: (copyVariants: CopyVariant[], images: ImageAsset[], fallback: FallbackContent) => void;
  onBack: () => void;
}

export default function ContentGenerator({
  recommendation,
  profiles,
  goal,
  onComplete,
  onBack,
}: ContentGeneratorProps) {
  const [loading, setLoading] = useState(true);
  const [copyLoading, setCopyLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);

  const [headlines, setHeadlines] = useState<string[]>([]);
  const [subheadlines, setSubheadlines] = useState<string[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<number>(0);
  const [selectedSubheadline, setSelectedSubheadline] = useState<number>(0);

  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [fallbackHeadline, setFallbackHeadline] = useState('Discover your next adventure');
  const [fallbackSubheadline, setFallbackSubheadline] = useState('Explore personalized recommendations just for you');

  // Generate copy
  useEffect(() => {
    async function generateCopy() {
      try {
        // Get sample values from profiles
        const sampleProfile = profiles[0] || {};
        const fields = recommendation.fields_used.map((field) => ({
          name: field,
          description: field.replace(/_/g, ' '),
          sample_value: String(sampleProfile[field] || 'example'),
        }));

        const response = await fetch('/api/generate/copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields, goal }),
        });

        if (response.ok) {
          const data = await response.json();
          setHeadlines(data.headlines || []);
          setSubheadlines(data.subheadlines || []);
        }
      } catch (err) {
        console.error('Copy generation failed:', err);
        // Set defaults
        setHeadlines([
          `Welcome back, {{given_name}}!`,
          `{{given_name}}, we have something for you`,
          `Hello {{given_name}}, explore what's new`,
        ]);
        setSubheadlines([
          `Discover personalized offers just for you`,
          `See what's waiting for you today`,
        ]);
      } finally {
        setCopyLoading(false);
      }
    }

    generateCopy();
  }, [recommendation, profiles, goal]);

  // Search for images
  useEffect(() => {
    async function searchImages() {
      try {
        // Build search query from recommendation context
        const sampleProfile = profiles[0] || {};
        let query = 'travel adventure';

        // Try to use destination if available
        if (sampleProfile.next_trip_destination_city) {
          query = `${sampleProfile.next_trip_destination_city} travel`;
        } else if (sampleProfile.most_frequent_destination) {
          query = `${sampleProfile.most_frequent_destination} travel`;
        }

        const response = await fetch('/api/generate/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, orientation: 'landscape', count: 8 }),
        });

        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
          if (data.images?.length > 0) {
            setSelectedImage(data.images[0].id);
          }
        }
      } catch (err) {
        console.error('Image search failed:', err);
      } finally {
        setImagesLoading(false);
      }
    }

    searchImages();
  }, [profiles]);

  // Update loading state
  useEffect(() => {
    if (!copyLoading && !imagesLoading) {
      setLoading(false);
    }
  }, [copyLoading, imagesLoading]);

  const handleContinue = () => {
    const selectedImg = images.find((img) => img.id === selectedImage);

    const copyVariants: CopyVariant[] = [
      {
        id: 'variant-1',
        headline: headlines[selectedHeadline] || 'Welcome!',
        subheadline: subheadlines[selectedSubheadline],
      },
    ];

    const imageAssets: ImageAsset[] = selectedImg
      ? [
          {
            id: selectedImg.id,
            url: selectedImg.url,
            alt_text: selectedImg.alt_description,
            unsplash_id: selectedImg.id,
            photographer: selectedImg.photographer,
            photographer_url: selectedImg.photographer_url,
          },
        ]
      : [];

    const fallback: FallbackContent = {
      headline: fallbackHeadline,
      subheadline: fallbackSubheadline,
      image_url: selectedImg?.url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
      image_alt: 'Travel inspiration',
    };

    onComplete(copyVariants, imageAssets, fallback);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amperity-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Generating personalized content...</p>
            <p className="text-sm text-gray-500 mt-2">
              {copyLoading ? 'Creating copy variations...' : 'Searching for images...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Generate Content</h3>
      <p className="text-gray-600 mb-6">
        Select your preferred headlines, images, and configure fallback content for anonymous visitors.
      </p>

      <div className="space-y-8">
        {/* Headlines */}
        <div>
          <h4 className="font-medium mb-3">Headlines</h4>
          <div className="space-y-2">
            {headlines.map((headline, index) => (
              <label
                key={index}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedHeadline === index
                    ? 'border-amperity-blue bg-amperity-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="headline"
                  checked={selectedHeadline === index}
                  onChange={() => setSelectedHeadline(index)}
                  className="mr-3"
                />
                <span className="font-medium">{headline}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subheadlines */}
        <div>
          <h4 className="font-medium mb-3">Subheadlines</h4>
          <div className="space-y-2">
            {subheadlines.map((subheadline, index) => (
              <label
                key={index}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSubheadline === index
                    ? 'border-amperity-blue bg-amperity-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="subheadline"
                  checked={selectedSubheadline === index}
                  onChange={() => setSelectedSubheadline(index)}
                  className="mr-3"
                />
                <span>{subheadline}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <h4 className="font-medium mb-3">Select Image</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image.id)}
                className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage === image.id
                    ? 'border-amperity-blue ring-2 ring-amperity-blue/20'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image.thumb_url}
                  alt={image.alt_description}
                  className="w-full h-full object-cover"
                />
                {selectedImage === image.id && (
                  <div className="absolute inset-0 bg-amperity-blue/10 flex items-center justify-center">
                    <div className="w-8 h-8 bg-amperity-blue rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {images.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Photos from Unsplash. Attribution will be included.
            </p>
          )}
        </div>

        {/* Fallback Content */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Fallback Content (for anonymous visitors)</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fallback Headline</label>
              <input
                type="text"
                value={fallbackHeadline}
                onChange={(e) => setFallbackHeadline(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fallback Subheadline</label>
              <input
                type="text"
                value={fallbackSubheadline}
                onChange={(e) => setFallbackSubheadline(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="btn btn-secondary">
          Back
        </button>
        <button onClick={handleContinue} className="btn btn-primary">
          Continue
        </button>
      </div>
    </div>
  );
}
