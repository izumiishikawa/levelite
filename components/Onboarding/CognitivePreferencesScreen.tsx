import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../Text';
import Title from '../Title';

interface CognitivePreferencesScreenProps {
  onNext: (data: { cognitiveChallengePreference: string; studyFrequency: string; selfDisciplineLevel: string }) => void;
  onPrevious: () => void;
}

export const CognitivePreferencesScreen: React.FC<CognitivePreferencesScreenProps> = ({ onNext, onPrevious }) => {
  const [cognitiveChallengePreference, setCognitiveChallengePreference] = useState('');
  const [studyFrequency, setStudyFrequency] = useState('');
  const [selfDisciplineLevel, setSelfDisciplineLevel] = useState('');

  const cognitiveLevels = [
    { label: "Light", value: "low" },
    { label: "Moderate", value: "medium" },
    { label: "Intense", value: "hard" },
  ];

  const studyFrequencies = [
    { label: "Daily", value: "daily" },
    { label: "3-4 times a week", value: "3-4" },
    { label: "1-2 times a week", value: "1-2" },
    { label: "Rarely", value: "rarely" },
  ];

  const disciplineLevels = [
    { label: "High", value: "high" },
    { label: "Moderate", value: "medium" },
    { label: "Low", value: "low" },
  ];

  const handleNext = () => {
    if (cognitiveChallengePreference && studyFrequency && selfDisciplineLevel) {
      onNext({ cognitiveChallengePreference, studyFrequency, selfDisciplineLevel });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="w-[100%]">

      <View className="mt-32 mx-auto w-[80%]">
        <Title text="Cognitive Info" />
        <Text className="mb-2 mx-auto mt-10 text-[#B8B8B8]">Mental Challenge Preference</Text>
      </View>

      {cognitiveLevels.map((level) => (
        <TouchableOpacity
          key={level.value}
          onPress={() => setCognitiveChallengePreference(level.value)}
          className={`py-4 mb-4 my-1 ${cognitiveChallengePreference === level.value ? "w-full" : "w-[90%]"} ${cognitiveChallengePreference === level.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
        >
          <Text className="text-white font-semibold text-center">{level.label}</Text>
          <View className="absolute bottom-[-6px] right-[-12px] h-16 w-10 rotate-[15deg] bg-[--background]" />
        </TouchableOpacity>
      ))}

      {/* Study/Intellectual Development Frequency */}
      <View className="mt-4">
        <Text className="text-[#B8B8B8] mx-auto mb-2">Study/Intellectual Development Frequency</Text>
        {studyFrequencies.map((frequency) => (
          <TouchableOpacity
            key={frequency.value}
            onPress={() => setStudyFrequency(frequency.value)}
            className={`py-4 mb-4 my-1 ${studyFrequency === frequency.value ? "w-full" : "w-[90%]"} ${studyFrequency === frequency.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
          >
            <Text className="text-white font-semibold text-center">{frequency.label}</Text>
            <View className="absolute bottom-[-6px] right-[-12px] h-16 w-10 rotate-[15deg] bg-[--background]" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Self-Discipline Level */}
      <View className="mt-4">
        <Text className="text-[#B8B8B8] mx-auto mb-2">Self-Discipline Level</Text>
        {disciplineLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            onPress={() => setSelfDisciplineLevel(level.value)}
            className={`py-4 mb-4 my-1 ${selfDisciplineLevel === level.value ? "w-full" : "w-[90%]"} ${selfDisciplineLevel === level.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
          >
            <Text className="text-white font-semibold text-center">{level.label}</Text>
            <View className="absolute bottom-[-6px] right-[-12px] h-16 w-10 rotate-[15deg] bg-[--background]" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation Buttons */}
      <View className="flex flex-col justify-between w-[80%] mx-auto mt-6 mb-12 gap-2">
        <TouchableOpacity 
          onPress={handleNext} 
          className={`w-full p-4 rounded-md items-center ${cognitiveChallengePreference && studyFrequency && selfDisciplineLevel ? 'bg-[--accent]' : 'bg-gray-500 opacity-50'}`}
          disabled={!cognitiveChallengePreference || !studyFrequency || !selfDisciplineLevel}
        >
          <Text className="text-white font-bold">Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPrevious} className="w-full bg-[--foreground] p-4 rounded-md items-center">
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CognitivePreferencesScreen;
