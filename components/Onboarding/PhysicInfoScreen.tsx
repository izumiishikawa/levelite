import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../Text';
import Title from '../Title';

interface PhysicInfoScreenProps {
  onNext: (data: {
    height: string;
    weight: string;
    exerciseFrequency: string;
    exerciseIntensity: string;
  }) => void;
  onPrevious: () => void;
}

export const PhysicInfoScreen: React.FC<PhysicInfoScreenProps> = ({ onNext, onPrevious }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('');
  const [showExerciseIntensity, setShowExerciseIntensity] = useState(false);

  const frequencies = [
    { label: 'Sedentary', value: 'sedentary' },
    { label: '1-2 times per week', value: '1-2' },
    { label: '3-5 times per week', value: '3-5' },
    { label: 'Daily', value: 'daily' },
  ];

  const intensities = [
    { label: 'Light', value: 'low' },
    { label: 'Moderate', value: 'medium' },
    { label: 'Intense', value: 'hard' },
  ];

  const handleNext = () => {
    if (
      height &&
      weight &&
      exerciseFrequency &&
      (exerciseFrequency === 'sedentary' || exerciseIntensity)
    ) {
      onNext({ height, weight, exerciseFrequency, exerciseIntensity });
    }
  };

  const allFieldsFilled =
    height &&
    weight &&
    exerciseFrequency &&
    (exerciseFrequency === 'sedentary' || exerciseIntensity);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      className="w-full">
      <View className="mt-32 w-[80%] mx-auto">
        <Title text="Your Physical Information" />
      </View>
      {/* Height Input */}
      <View className="w-[100%]">
        <Text className="mb-2 mt-10 mx-auto text-[#B8B8B8]">Height (in cm)</Text>
        <View className="relative w-full">
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Ex: 175"
            placeholderTextColor="#7D7D7D"
            className="w-full pl-16 bg-[--foreground] py-4 text-white"
          />
          <View className="absolute bottom-[-6px] right-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
          <View className="absolute bottom-[-6px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        </View>

        {/* Weight Input */}
        <Text className="mb-2 mx-auto mt-5 text-[#B8B8B8]">Weight (in kg)</Text>
        <View className="relative w-full">
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Ex: 70"
            placeholderTextColor="#7D7D7D"
            className="w-full pl-16 bg-[--foreground] py-4 text-white"
          />
          <View className="absolute bottom-[-6px] right-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
          <View className="absolute bottom-[-6px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        </View>
      </View>

      {/* Exercise Frequency */}
      <Text className="mb-2 mt-10 mx-auto text-[#B8B8B8]">Exercise Frequency</Text>
      {frequencies.map((freq) => (
        <TouchableOpacity
          key={freq.value}
          onPress={() => {
            setExerciseFrequency(freq.value);
            setShowExerciseIntensity(freq.value !== 'sedentary');
            if (freq.value === 'sedentary') {
              setExerciseIntensity(''); // Clear intensity if sedentary
            }
          }}
          className={`relative my-1 mb-4 flex items-center justify-start self-start py-4 uppercase ${exerciseFrequency === freq.value ? "w-full" : "w-[90%]"} ${
            exerciseFrequency === freq.value ? 'bg-[--accent]' : 'bg-[--foreground]'
          }`}>
          <Text className="text-md font-semibold uppercase text-white">{freq.label}</Text>
          <View className="absolute bottom-[-6px] right-[-12px] h-16 w-10 rotate-[15deg] bg-[--background]" />
        </TouchableOpacity>
      ))}

      {/* Exercise Intensity (If not Sedentary) */}
      {showExerciseIntensity && (
        <>
          <Text className="mb-2 mt-4 mx-auto text-[#B8B8B8]">Exercise Intensity</Text>
          {intensities.map((intensity) => (
            <TouchableOpacity
              key={intensity.value}
              onPress={() => setExerciseIntensity(intensity.value)}
              className={`relative my-1 mb-4 flex ${exerciseIntensity === intensity.value ? "w-full" : "w-[90%]"} items-center justify-start self-start py-4 uppercase ${
                exerciseIntensity === intensity.value ? 'bg-[--accent]' : 'bg-[--foreground]'
              }`}>
              <Text className="text-md font-semibold uppercase text-white">{intensity.label}</Text>
              <View className="absolute bottom-[-6px] right-[-12px] h-16 w-10 rotate-[15deg] bg-[--background]" />
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Navigation Buttons */}
      <View className="bottom-10 mt-12 flex w-[80%] mx-auto flex-col justify-between gap-2">
        <TouchableOpacity
          onPress={handleNext}
          className={`w-full rounded-md py-4 ${
            allFieldsFilled ? 'bg-[--accent]' : 'bg-gray-500 opacity-50'
          } flex items-center justify-center`}
          disabled={!allFieldsFilled}>
          <Text className="font-semibold text-white">Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPrevious}
          className="flex w-full items-center justify-center rounded-md bg-[--foreground] py-4">
          <Text className="font-semibold text-white">Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PhysicInfoScreen;
