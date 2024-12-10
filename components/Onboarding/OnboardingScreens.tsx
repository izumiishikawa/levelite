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
}

export const OnboardingScreens: React.FC<OnboardingScreensProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>({});

  useEffect(() => {
    console.log(playerProfile);
  }, [playerProfile]);

  const handleNextStep = (updatedProfile: Partial<PlayerProfile> = {}) => {
    setPlayerProfile((prevProfile) => ({ ...prevProfile, ...updatedProfile }));
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleComplete = async () => {
    try {
      await createOrUpdatePlayerProfile('673666aaec06d31576b6f4eb', playerProfile); 
      onComplete();
    } catch (error) {
      console.error("Error submitting player profile:", error);
    }
  };

  const steps = [
    <WelcomeScreen onNext={() => handleNextStep()} />,
    <ObjectivesScreen onNext={(mainGoal) => handleNextStep({ mainGoal })} onPrevious={handlePreviousStep} />,
    <PhysicInfoScreen onNext={(data) => handleNextStep(data)} onPrevious={handlePreviousStep} />,
    <CognitivePreferencesScreen onNext={(data) => handleNextStep(data)} onPrevious={handlePreviousStep} />,
    <InitialBuildScreen onNext={(attributes) => handleNextStep(attributes)} onPrevious={handlePreviousStep} />,
    <ReadyScreen onNext={handleComplete} />,
  ];

  return (
    <View className="flex justify-center items-center bg-[--background] h-full">
      <ProgressIndicator
        className="absolute w-[80%] top-20 z-20"
        value={currentStep}
        max={steps.length - 1}
      />
      {steps[currentStep]}
    </View>
  );
};

export default OnboardingScreens;
