// Widget Code Generator
// Generates the JavaScript snippet for embedding widgets

import type { PersonalizationConfig } from '@/types';

/**
 * Generate the embed snippet HTML for a configuration
 */
export function generateEmbedSnippet(
  configId: string,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || ''
): string {
  return `<!-- Amperity Personalization Widget -->
<div id="amp-widget-${configId}"></div>
<script src="${appUrl}/api/widget?config=${configId}" async></script>`;
}

/**
 * Generate the widget JavaScript code
 */
export function generateWidgetCode(config: PersonalizationConfig, appUrl: string): string {
  const { id, widget_config, personalization, identity_config } = config;

  return `(function() {
  'use strict';

  var CONFIG_ID = '${id}';
  var API_BASE = '${appUrl}';
  var CONTAINER_ID = 'amp-widget-' + CONFIG_ID;

  // Widget configuration
  var widgetConfig = ${JSON.stringify(widget_config)};
  var fallbackContent = ${JSON.stringify(personalization.fallback_content)};
  var copyVariants = ${JSON.stringify(personalization.copy_variants)};
  var imageAssets = ${JSON.stringify(personalization.image_assets)};
  var fieldsUsed = ${JSON.stringify(personalization.fields_used)};
  var identityConfig = ${JSON.stringify(identity_config)};

  // Utility: Get nested value from object
  function getNestedValue(obj, path) {
    return path.split('.').reduce(function(o, k) {
      return o && o[k];
    }, obj);
  }

  // Utility: Replace placeholders in text
  function replacePlaceholders(text, data) {
    return text.replace(/\\{\\{(\\w+)\\}\\}/g, function(match, field) {
      return data[field] !== undefined && data[field] !== null ? data[field] : '';
    });
  }

  // Identity resolution
  function resolveIdentity() {
    // 1. URL parameter override (for testing)
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('amp_email')) {
      return { type: 'email', value: urlParams.get('amp_email') };
    }
    if (urlParams.has('amp_test') && urlParams.has('amp_id')) {
      return { type: identityConfig.id_type || 'email', value: urlParams.get('amp_id') };
    }

    // 2. Data layer variable
    if (identityConfig.data_layer_path && window[identityConfig.data_layer_path.split('.')[0]]) {
      var value = getNestedValue(window, identityConfig.data_layer_path);
      if (value) {
        return { type: identityConfig.id_type || 'email', value: value };
      }
    }

    // 3. Global identity object
    if (window.ampIdentity && window.ampIdentity.email) {
      return { type: 'email', value: window.ampIdentity.email };
    }

    // 4. Static identity (for demo)
    if (identityConfig.static_identity) {
      return { type: identityConfig.id_type || 'email', value: identityConfig.static_identity };
    }

    return null;
  }

  // Fetch personalization data
  function fetchPersonalizationData(identity, callback) {
    if (!identity) {
      callback(null, false);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/api/profiles/' + CONFIG_ID + '/lookup?id_value=' + encodeURIComponent(identity.value));
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          callback(response.personalization_data, response.has_identity);
        } catch (e) {
          callback(null, false);
        }
      } else {
        callback(null, false);
      }
    };
    xhr.onerror = function() {
      callback(null, false);
    };
    xhr.timeout = 3000; // 3 second timeout
    xhr.ontimeout = function() {
      callback(null, false);
    };
    xhr.send();
  }

  // Select appropriate content based on conditions
  function selectContent(variants, data) {
    // For now, return the first variant (condition logic can be added later)
    return variants[0] || null;
  }

  // Select appropriate image based on conditions
  function selectImage(assets, data) {
    // For now, return the first image (condition logic can be added later)
    return assets[0] || null;
  }

  // Generate widget styles
  function generateStyles() {
    return \`
      .amp-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: \${widgetConfig.width};
        max-width: \${widgetConfig.max_width}px;
        margin: 0 auto;
        border-radius: \${widgetConfig.border_radius}px;
        overflow: hidden;
        background-color: \${widgetConfig.background_color};
        color: \${widgetConfig.text_color};
        box-sizing: border-box;
      }
      .amp-widget * {
        box-sizing: border-box;
      }
      .amp-widget--hero_banner {
        position: relative;
        min-height: 300px;
      }
      .amp-widget__image {
        width: 100%;
        height: 300px;
        object-fit: cover;
      }
      .amp-widget__content {
        padding: 24px;
        ${widgetConfig.type === 'hero_banner' ? 'position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7));' : ''}
      }
      .amp-widget__headline {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
        ${widgetConfig.type === 'hero_banner' ? 'color: #fff;' : ''}
      }
      .amp-widget__subheadline {
        font-size: 16px;
        margin: 0 0 16px 0;
        opacity: 0.9;
        ${widgetConfig.type === 'hero_banner' ? 'color: #fff;' : ''}
      }
      .amp-widget__cta {
        display: inline-block;
        padding: 12px 24px;
        background-color: \${widgetConfig.type === 'hero_banner' ? '#fff' : widgetConfig.text_color};
        color: \${widgetConfig.type === 'hero_banner' ? '#000' : widgetConfig.background_color};
        text-decoration: none;
        font-weight: 600;
        border-radius: 6px;
        transition: opacity 0.2s;
      }
      .amp-widget__cta:hover {
        opacity: 0.9;
      }
      .amp-widget__skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: amp-shimmer 1.5s infinite;
      }
      @keyframes amp-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .amp-widget--fade {
        animation: amp-fade-in 0.3s ease-in-out;
      }
      .amp-widget--slide {
        animation: amp-slide-up 0.3s ease-out;
      }
      @keyframes amp-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes amp-slide-up {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    \`;
  }

  // Render skeleton loader
  function renderSkeleton(container) {
    if (widgetConfig.loading_behavior === 'none') return;

    var skeletonHtml = \`
      <div class="amp-widget amp-widget--\${widgetConfig.type}">
        \${widgetConfig.type === 'hero_banner' ? '<div class="amp-widget__image amp-widget__skeleton"></div>' : ''}
        <div class="amp-widget__content">
          <div class="amp-widget__headline amp-widget__skeleton" style="height: 32px; width: 70%;"></div>
          <div class="amp-widget__subheadline amp-widget__skeleton" style="height: 20px; width: 50%; margin-top: 8px;"></div>
        </div>
      </div>
    \`;

    container.innerHTML = skeletonHtml;
  }

  // Render personalized content
  function renderContent(container, data, hasIdentity) {
    var content, image;

    if (hasIdentity && data && Object.keys(data).length > 0) {
      content = selectContent(copyVariants, data);
      image = selectImage(imageAssets, data);
    }

    // Use fallback if no personalized content
    if (!content) {
      content = {
        headline: fallbackContent.headline,
        subheadline: fallbackContent.subheadline
      };
      image = {
        url: fallbackContent.image_url,
        alt_text: fallbackContent.image_alt
      };
    }

    var headline = data ? replacePlaceholders(content.headline, data) : content.headline;
    var subheadline = data && content.subheadline ? replacePlaceholders(content.subheadline, data) : (content.subheadline || '');

    var animationClass = widgetConfig.animation !== 'none' ? 'amp-widget--' + widgetConfig.animation : '';

    var html = \`
      <div class="amp-widget amp-widget--\${widgetConfig.type} \${animationClass}">
        \${image && widgetConfig.type === 'hero_banner' ? \`<img class="amp-widget__image" src="\${image.url}" alt="\${image.alt_text}" />\` : ''}
        <div class="amp-widget__content">
          <h2 class="amp-widget__headline">\${headline}</h2>
          \${subheadline ? \`<p class="amp-widget__subheadline">\${subheadline}</p>\` : ''}
          <a href="\${widgetConfig.cta_url}" class="amp-widget__cta">\${widgetConfig.cta_text}</a>
        </div>
      </div>
    \`;

    container.innerHTML = html;
  }

  // Initialize widget
  function init() {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.error('[Amperity Widget] Container not found:', CONTAINER_ID);
      return;
    }

    // Create shadow DOM for style isolation
    var shadow = container.attachShadow({ mode: 'closed' });
    var styleEl = document.createElement('style');
    styleEl.textContent = generateStyles();
    shadow.appendChild(styleEl);

    var wrapper = document.createElement('div');
    shadow.appendChild(wrapper);

    // Show skeleton immediately
    renderSkeleton(wrapper);

    // Resolve identity and fetch data
    var identity = resolveIdentity();
    fetchPersonalizationData(identity, function(data, hasIdentity) {
      renderContent(wrapper, data, hasIdentity);
    });
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;
}
