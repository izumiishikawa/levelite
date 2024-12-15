import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMat from "react-native-vector-icons/MaterialIcons"

// import { Container } from './styles';

export const TaskConcluded = ({status}: {status: "completed" | "pending"}) => {
  return (
    <View className='px-2 py-1 flex flex-row items-center gap-1 bg-[--foreground] rounded-full'>
      <View className='bg-[--accent] w-fit rounded-full p-1'>
        {status === "completed" ?    <Icon name="check-bold" size={8} color="#fff" /> : <IconMat name='pending-actions' size={8} color="#fff" />}
      </View>
      <Text className='text-white text-xs capitalize'>{status}</Text>
    </View>
  );
};
