import React from 'react';
import { View, TouchableOpacity, Image, GestureResponderEvent } from 'react-native';
import { IntensityLevelTag } from './IntensityLevelTag';
import Text from './Text';

interface SkillBookProps {
  title: string;
  level: 'low' | 'medium' | 'high';
  icon: string | number; // Pode ser uma URL ou um `require`
  description: string;
  onOpen: (event: GestureResponderEvent) => void; // Função para abrir o livro
}

const intensityLevels = {
  low: {
    color: '#996DFF',
    text: 'Easy',
  },
  medium: {
    color: '#FAAF00',
    text: 'Medium',
  },
  high: {
    color: '#ED6466',
    text: 'Hard',
  },
}

export const SkillBook: React.FC<SkillBookProps> = ({
  title,
  level,
  icon,
  description,
  onOpen,
}) => {
  return (
    <TouchableOpacity onPress={onOpen}>
      <View className="w-30 z-20 flex h-56 max-h-56 min-w-36 max-w-36 flex-col items-center justify-center gap-2 rounded-lg bg-[#4343A9] px-2 py-4 shadow-lg">
        <Text className="text-center text-md font-bold text-white">{title}</Text>
      </View>
      <View className="absolute left-6 -z-10 h-52 mt-2 w-36 bg-[#282865] rounded-lg" />
      <View className="absolute left-2 -z-10 h-48 mt-4 w-36 bg-white drop-shadow-lg rounded-lg" />
    </TouchableOpacity>
  );
};
