import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-amperity-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Amperity Personalization Agent</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amperity-blue to-amperity-purple text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Transform Customer Data into Personalized Experiences
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Create AI-powered website personalization widgets using your Amperity Profile API data.
            No coding required.
          </p>
          <Link
            href="/wizard"
            className="inline-block bg-white text-amperity-blue px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Building
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              step={1}
              title="Connect Your Data"
              description="Link your Amperity Profile API with a few clicks. We securely connect to your customer data."
            />
            <FeatureCard
              step={2}
              title="Define Your Goal"
              description="Tell us what you want to achieve. Our AI analyzes your data and recommends personalization strategies."
            />
            <FeatureCard
              step={3}
              title="Deploy Your Widget"
              description="Customize the look and feel, then get a simple code snippet to add to your website."
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Personalization Use Cases</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UseCaseCard
              title="Welcome Returning Customers"
              description="Greet customers by name and show relevant offers based on their history."
            />
            <UseCaseCard
              title="Trip Countdown"
              description="Create excitement with personalized countdowns to upcoming trips or events."
            />
            <UseCaseCard
              title="Loyalty Recognition"
              description="Highlight tier status and exclusive benefits for loyalty program members."
            />
            <UseCaseCard
              title="Re-engagement"
              description="Win back lapsed customers with tailored offers based on past preferences."
            />
            <UseCaseCard
              title="Cross-sell Opportunities"
              description="Recommend complementary products based on purchase history."
            />
            <UseCaseCard
              title="Destination Inspiration"
              description="Show personalized destination imagery based on travel preferences."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-8">
            Create your first personalization widget in minutes. All you need is your Amperity Profile API credentials.
          </p>
          <Link
            href="/wizard"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Launch Wizard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>Amperity Personalization Agent - Demo / POC Tool</p>
          <p className="text-sm mt-2">Not for production use without proper security review</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-amperity-teal text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function UseCaseCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
