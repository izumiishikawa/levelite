import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { WelcomeScreen } from './WelcomeScreen';
import { ReadyScreen } from './ReadyScreen';
import ObjectivesScreen from './ObjectivesScreen';
import PhysicInfoScreen from './PhysicInfoScreen';
import CognitivePreferencesScreen from './CognitivePreferencesScreen';
import { ProgressIndicator } from '../nativewindui/ProgressIndicator';
import InitialBuildScreen from './InitialBuildScreen';
import { createOrUpdatePlayerProfile, generateAiTasks } from '~/services/api';
import ClassSelectionScreen from './ClassSelectionScreen';
import HimariScreen from './HimariIntroduction';

interface OnboardingScreensProps {
  onComplete: () => void;
}

interface PlayerProfile {
  mainGoal?: string;
  height?: string;
  weight?: string;
  exerciseFrequency?: string;
  exerciseIntensity?: string;
  cognitiveChallengePreference?: string;
  selfDisciplineLevel?: string;
  studyFrequency?: string;
  aura?: number;
  vitality?: number;
  focus?: number;
  selectedClass?: string;
}

export const OnboardingScreens: React.FC<OnboardingScreensProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>({});

  const handleNextStep = (updatedProfile: Partial<PlayerProfile> = {}) => {
    setPlayerProfile((prevProfile) => ({ ...prevProfile, ...updatedProfile }));
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleComplete = async () => {
    try {
      await createOrUpdatePlayerProfile(playerProfile);
      onComplete();
    } catch (error) {
      console.error('Error submitting player profile:', error);
    }
  };

  const steps = [
    <WelcomeScreen onNext={() => handleNextStep()} />,
    <ObjectivesScreen
      onNext={(mainGoal) => handleNextStep({ mainGoal })}
      onPrevious={handlePreviousStep}
    />,
    <PhysicInfoScreen onNext={(data) => handleNextStep(data)} onPrevious={handlePreviousStep} />,
    <CognitivePreferencesScreen
      onNext={(data) => handleNextStep(data)}
      onPrevious={handlePreviousStep}
    />,
    <InitialBuildScreen
      onNext={(attributes) => handleNextStep(attributes)}
      onPrevious={handlePreviousStep}
    />,
    <ClassSelectionScreen
      onNext={(selectedClass) => handleNextStep({ selectedClass })}
      onPrevious={handlePreviousStep}
    />,
    <ReadyScreen onNext={() => handleComplete()} />,
  ];

  return (
    <View className="flex h-full items-center justify-center bg-[--background]">
      <View className="absolute top-0 pt-6 items-center z-20 flex h-20 w-full flex-row justify-center bg-[--background]">
        <ProgressIndicator
          className="w-[80%] mt-3"
          barColor="#996DFF"
          value={currentStep}
          max={steps.length - 1}
        />
      </View>
      {steps[currentStep]}
    </View>
  );
};

export default OnboardingScreens;
