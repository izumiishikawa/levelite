import React from 'react';
import { Text, View } from 'react-native';

// import { Container } from './styles';

const AttributeCard = ({ icon, isCompleted }: { icon: string; isCompleted: boolean }) => {
  return (
    <View
      className={`${
        isCompleted ? 'border-gray-400' : 'border-[--accent]'
      } flex h-14 w-10 items-center justify-center border-4 bg-[--foreground]`}>
      <Text className="text-lg">{icon}</Text>
    </View>
  );
};

export default AttributeCard;
