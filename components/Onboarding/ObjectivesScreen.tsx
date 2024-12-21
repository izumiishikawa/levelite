import React, { useState } from 'react';
import Text from '../Text';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import Title from '../Title';

interface ObjectivesScreenProps {
  onNext: (selectedOption: string) => void;
  onPrevious: () => void;
}

export const ObjectivesScreen: React.FC<ObjectivesScreenProps> = ({ onNext, onPrevious }) => {
  const objectives = [
    { text: 'Develop Strength 💪', option: 'develop_strength' },
    { text: 'Increase Endurance 🏃‍♂️', option: 'increase_endurance' },
    { text: 'Improve Mental Focus 🧠', option: 'improve_focus' },
    { text: 'Gain Discipline 📘', option: 'gain_discipline' },
    { text: 'Evolve in All Aspects 🌟', option: 'evolve_all' },
  ];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <ScrollView className='w-full'>
  <View className="flex pt-32 h-full w-full flex-col items-center justify-center">
      <View className="w-[80%]">
        <View className="w-full">
          <Title text="What do you seek?" />
        </View>
        <Text className="my-6 text-center text-[#B8B8B8]">
          Let’s build your player profile. Tell us, what do you aim for?
        </Text>
      </View>

      {objectives.map((objective) => (
        <TouchableOpacity
          key={objective.option}
          className={`my-1 mb-4 self-start relative uppercase py-4 flex items-center justify-start ${
            selectedOption === objective.option ? 'bg-[--accent]' : 'bg-[--foreground]'
          } ${selectedOption === objective.option ? "w-full" : "w-[90%]"}`}
          onPress={() => setSelectedOption(objective.option)}>
          <Text className="text-md uppercase font-semibold text-white">{objective.text}</Text>
          <View className="absolute bottom-[-6px] right-[-12px] h-16 w-10 rotate-[15deg] bg-[--background]" />
        </TouchableOpacity>
      ))}

      <View className="bottom-10 mt-12 flex w-[80%] flex-col justify-between gap-2">
        <TouchableOpacity
          className={`w-full rounded-md py-4 ${
            selectedOption ? 'bg-[--accent]' : 'bg-gray-500 opacity-50'
          } flex items-center justify-center`}
          onPress={() => selectedOption && onNext(selectedOption)}
          disabled={!selectedOption}>
          <Text className="font-semibold text-white">Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex w-full items-center justify-center rounded-md bg-[--foreground] py-4"
          onPress={onPrevious}>
          <Text className="font-semibold text-white">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  
  );
};

export default ObjectivesScreen;
