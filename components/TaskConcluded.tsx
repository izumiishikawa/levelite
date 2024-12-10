import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// import { Container } from './styles';

export const TaskConcluded: React.FC = () => {
  return (
    <View className='px-2 py-1 flex flex-row items-center gap-1 bg-[--foreground] rounded-full'>
      <View className='bg-[--accent] w-fit rounded-full p-1'>
        <Icon name="check-bold" size={8} color="#fff" />
      </View>
      <Text className='text-white text-xs'>Concluida</Text>
    </View>
  );
};
