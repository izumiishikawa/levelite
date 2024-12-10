import React from 'react';
import { View } from 'react-native';
import Text from './Text';

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
};

export const IntensityLevelTag = ({ level }: { level: "low" | "medium" | "high" }) => {
  return (
    <View
      style={{ backgroundColor: intensityLevels[level].color }}
      className="px-4 py-1 rounded-full flex flex-row justify-center items-center"
    >
      <Text className="text-white font-bold text-xs">{intensityLevels[level].text}</Text>
    </View>
  );
};
