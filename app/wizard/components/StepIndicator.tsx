'use client';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-amperity-blue text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium ${
                    step.id === currentStep ? 'text-amperity-blue' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 md:w-16 mx-2 ${
                  step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Description */}
      <div className="mt-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Step {currentStep}: {steps[currentStep - 1]?.name}
        </h2>
        <p className="text-gray-600 mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
