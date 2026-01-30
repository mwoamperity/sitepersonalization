'use client';

import { useState } from 'react';
import StepIndicator from './components/StepIndicator';
import ApiConfigForm from './components/ApiConfigForm';
import SampleDataForm from './components/SampleDataForm';
import GoalInput from './components/GoalInput';
import RecommendationCards from './components/RecommendationCards';
import ContentGenerator from './components/ContentGenerator';
import WidgetConfigurator from './components/WidgetConfigurator';
import SnippetOutput from './components/SnippetOutput';
import type { WizardState, ApiConfig, PersonalizationRecommendation, CopyVariant, ImageAsset, FallbackContent, WidgetConfig } from '@/types';

const STEPS = [
  { id: 1, name: 'Connect API', description: 'Link your Amperity Profile API' },
  { id: 2, name: 'Sample Data', description: 'Provide sample customer IDs' },
  { id: 3, name: 'Define Goal', description: 'Describe your personalization goal' },
  { id: 4, name: 'Recommendations', description: 'Review AI recommendations' },
  { id: 5, name: 'Generate Content', description: 'Create copy and select images' },
  { id: 6, name: 'Customize Widget', description: 'Configure appearance' },
  { id: 7, name: 'Deploy', description: 'Get your embed code' },
];

const DEFAULT_WIDGET_CONFIG: Partial<WidgetConfig> = {
  type: 'hero_banner',
  width: '100%',
  height: 'auto',
  max_width: 1200,
  border_radius: 8,
  background_color: '#ffffff',
  text_color: '#1a1a1a',
  cta_text: 'Learn More',
  cta_url: '#',
  animation: 'fade',
  loading_behavior: 'skeleton',
};

export default function WizardPage() {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    api_config: {},
    sample_ids: [],
    sample_profiles: [],
    goal: '',
    copy_variants: [],
    selected_images: [],
    widget_config: DEFAULT_WIDGET_CONFIG,
  });

  const [configId, setConfigId] = useState<string | null>(null);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setState((prev) => ({ ...prev, currentStep: step }));
    }
  };

  const handleApiConfigComplete = (config: ApiConfig, profiles: Record<string, unknown>[]) => {
    setState((prev) => ({
      ...prev,
      api_config: config,
      sample_profiles: profiles,
      currentStep: 2,
    }));
  };

  const handleSampleDataComplete = (ids: string[], profiles: Record<string, unknown>[]) => {
    setState((prev) => ({
      ...prev,
      sample_ids: ids,
      sample_profiles: profiles,
      currentStep: 3,
    }));
  };

  const handleGoalComplete = (goal: string) => {
    setState((prev) => ({
      ...prev,
      goal,
      currentStep: 4,
    }));
  };

  const handleRecommendationSelect = (recommendation: PersonalizationRecommendation, analysisResult: WizardState['analysis_result']) => {
    setState((prev) => ({
      ...prev,
      selected_recommendation: recommendation,
      analysis_result: analysisResult,
      currentStep: 5,
    }));
  };

  const handleContentComplete = (
    copyVariants: CopyVariant[],
    images: ImageAsset[],
    fallback: FallbackContent
  ) => {
    setState((prev) => ({
      ...prev,
      copy_variants: copyVariants,
      selected_images: images,
      fallback_content: fallback,
      currentStep: 6,
    }));
  };

  const handleWidgetConfigComplete = (widgetConfig: WidgetConfig) => {
    setState((prev) => ({
      ...prev,
      widget_config: widgetConfig,
      currentStep: 7,
    }));
  };

  const handleDeployComplete = (newConfigId: string) => {
    setConfigId(newConfigId);
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <ApiConfigForm
            initialConfig={state.api_config}
            onComplete={handleApiConfigComplete}
          />
        );
      case 2:
        return (
          <SampleDataForm
            apiConfig={state.api_config as ApiConfig}
            initialIds={state.sample_ids}
            onComplete={handleSampleDataComplete}
            onBack={() => goToStep(1)}
          />
        );
      case 3:
        return (
          <GoalInput
            initialGoal={state.goal}
            onComplete={handleGoalComplete}
            onBack={() => goToStep(2)}
          />
        );
      case 4:
        return (
          <RecommendationCards
            profiles={state.sample_profiles}
            goal={state.goal}
            onSelect={handleRecommendationSelect}
            onBack={() => goToStep(3)}
          />
        );
      case 5:
        return (
          <ContentGenerator
            recommendation={state.selected_recommendation!}
            profiles={state.sample_profiles}
            goal={state.goal}
            onComplete={handleContentComplete}
            onBack={() => goToStep(4)}
          />
        );
      case 6:
        return (
          <WidgetConfigurator
            initialConfig={state.widget_config as WidgetConfig}
            copyVariants={state.copy_variants}
            images={state.selected_images}
            fallbackContent={state.fallback_content!}
            sampleProfile={state.sample_profiles[0]}
            onComplete={handleWidgetConfigComplete}
            onBack={() => goToStep(5)}
          />
        );
      case 7:
        return (
          <SnippetOutput
            wizardState={state}
            configId={configId}
            onDeploy={handleDeployComplete}
            onBack={() => goToStep(6)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <StepIndicator steps={STEPS} currentStep={state.currentStep} />
      <div className="mt-8 animate-fade-in">
        {renderStep()}
      </div>
    </div>
  );
}
