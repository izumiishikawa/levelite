import React from 'react';
import { View, Text } from 'react-native';

export const AttributeArc = ({ icon, percentage }: { icon: string; percentage: number }) => {
  return (
    <View className="flex flex-row justify-between gap-2 px-4 py-1 rounded-full bg-[--foreground] ">
      <Text>{icon}</Text>
      <Text className='text-white font-bold'>{percentage}</Text>
    </View>
  );
};
