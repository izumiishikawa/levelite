import React, { useState } from 'react';
import Text from '../Text';
import { View, TouchableOpacity } from 'react-native';
import Title from '../Title';
import AnimatedRollingNumbers from '../AnimatedRolling';

interface InitialBuildScreenProps {
  onNext: (attributes: {
    aura: number;
    vitality: number;
    focus: number;
  }) => void;
  onPrevious: () => void;
}

export const InitialBuildScreen: React.FC<InitialBuildScreenProps> = ({ onNext, onPrevious }) => {
  const [availablePoints, setAvailablePoints] = useState(12);
  const [attributes, setAttributes] = useState<{
    aura: number;
    vitality: number;
    focus: number;
  }>({
    aura: 0,
    vitality: 0,
    focus: 0,
  });

  const attributeInfo = [
    { name: 'Aura', emoji: '🤝', key: 'aura', description: 'Your charisma, influence, and personal presence.' },
    { name: 'Vitality', emoji: '💪', key: 'vitality', description: 'Your physical strength, endurance, and energy.' },
    { name: 'Focus', emoji: '🎯', key: 'focus', description: 'Your mental clarity, strategy, and determination.' },
  ] as const;

  const handleAddPoint = (attribute: keyof typeof attributes) => {
    if (availablePoints > 0) {
      setAttributes((prev) => ({ ...prev, [attribute]: prev[attribute] + 1 }));
      setAvailablePoints((prev) => prev - 1);
    }
  };

  const handleRemovePoint = (attribute: keyof typeof attributes) => {
    if (attributes[attribute] > 0) {
      setAttributes((prev) => ({ ...prev, [attribute]: prev[attribute] - 1 }));
      setAvailablePoints((prev) => prev + 1);
    }
  };

  return (
    <View className="flex h-full w-[90%] items-center justify-center p-6">
      <View className='w-full mb-6'>
        <Title text='Choose Your Path' />
      </View>
      <Text className="mb-6 text-center text-[#B8B8B8]">
        Distribute your points wisely. Your choices shape your journey and define the tasks you'll conquer.
      </Text>
      <Text className=" text-center text-[#B8B8B8]">Remaining Points:</Text>
      <View className='mb-6'>
      <AnimatedRollingNumbers value={availablePoints} textColor='#996DFF' fontSize={24} />

      </View>

      {attributeInfo.map((attr) => (
        <View key={attr.key} className="mb-4 flex w-full flex-row items-center justify-between">
          <View className='w-[70%]'>
            <Text className="text-lg text-white">
              {attr.emoji} {attr.name}
            </Text>
            <Text className="text-[#B8B8B8] text-xs">{attr.description}</Text>
          </View>

          <View className="flex flex-row items-center w-[30%] justify-end ">
            <TouchableOpacity
              onPress={() => handleRemovePoint(attr.key)}
              disabled={attributes[attr.key] === 0}
              className="mx-2 flex h-8 w-8 items-center justify-center rounded-md bg-[--foreground]">
              <Text className="text-white">-</Text>
            </TouchableOpacity>
            <Text className="text-lg text-white">{attributes[attr.key]}</Text>
            <TouchableOpacity
              onPress={() => handleAddPoint(attr.key)}
              disabled={availablePoints === 0}
              className="mx-2 flex h-8 w-8 items-center justify-center rounded-md bg-[--foreground]">
              <Text className="text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Navigation Buttons */}
      <View className="absolute bottom-10 mb-12 mt-6 flex w-full flex-col justify-between gap-2">
        <TouchableOpacity
          onPress={() => onNext(attributes)}
          disabled={availablePoints !== 0}
          className={`w-full ${availablePoints === 0 ? 'bg-[--accent]' : 'bg-gray-600'} items-center rounded-md p-4`}>
          <Text className="font-bold text-white">Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPrevious}
          className="w-full items-center rounded-md bg-[--foreground] p-4">
          <Text className="font-bold text-white">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InitialBuildScreen;