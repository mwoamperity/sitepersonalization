import { notFound } from 'next/navigation';

interface PreviewPageProps {
  params: Promise<{ configId: string }>;
  searchParams: Promise<{ amp_email?: string }>;
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { configId } = await params;
  const { amp_email } = await searchParams;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // Validate configId format
  if (!configId || !configId.startsWith('cfg_')) {
    notFound();
  }

  return (
    <html lang="en">
      <head>
        <title>Widget Preview - {configId}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
          }
          .preview-header {
            background: #1a365d;
            color: white;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .preview-header h1 {
            font-size: 18px;
            font-weight: 600;
          }
          .preview-controls {
            display: flex;
            gap: 12px;
            align-items: center;
          }
          .preview-controls input {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            width: 250px;
          }
          .preview-controls button {
            padding: 8px 16px;
            background: #319795;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
          }
          .preview-controls button:hover {
            background: #2c7a7b;
          }
          .preview-container {
            padding: 40px 24px;
            max-width: 1400px;
            margin: 0 auto;
          }
          .preview-info {
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .preview-info code {
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 13px;
          }
          #amp-widget-container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
        `}</style>
      </head>
      <body>
        <div className="preview-header">
          <h1>Widget Preview</h1>
          <div className="preview-controls">
            <input
              type="email"
              id="testEmail"
              placeholder="Enter email to test personalization"
              defaultValue={amp_email || ''}
            />
            <button id="updateBtn" type="button">Update Preview</button>
          </div>
        </div>

        <div className="preview-container">
          <div className="preview-info">
            <div>
              <strong>Config ID:</strong> <code>{configId}</code>
            </div>
            <div>
              <span id="preview-status">
                {amp_email ? `Showing personalized view for: ${amp_email}` : 'Showing fallback view (no identity)'}
              </span>
            </div>
          </div>

          <div id="amp-widget-container">
            {/* Widget will be injected here */}
            <div id={`amp-widget-${configId}`}></div>
          </div>
        </div>

        {/* Widget Script */}
        <script
          src={`${appUrl}/api/widget?config=${configId}`}
          async
        />

        {/* Preview Controls Script */}
        <script dangerouslySetInnerHTML={{ __html: `
          function updatePreview() {
            var email = document.getElementById('testEmail').value;
            var url = new URL(window.location.href);
            if (email) {
              url.searchParams.set('amp_email', email);
            } else {
              url.searchParams.delete('amp_email');
            }
            window.location.href = url.toString();
          }

          document.getElementById('updateBtn').addEventListener('click', updatePreview);

          document.getElementById('testEmail').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              updatePreview();
            }
          });
        `}} />
      </body>
    </html>
  );
}
