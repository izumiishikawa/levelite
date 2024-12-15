import React from 'react';
import { View } from 'react-native';
import Text from './Text';

const Title = ({ text }: { text: string }) => {
  return (
    <View>
      <View className="relative h-fit w-full bg-[--accent] py-3">
        <View className="absolute bottom-[-10px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        <View className="absolute bottom-[-10px] right-[-20px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        <Text className="text-center text-lg uppercase text-white w-full" extraBold>
          {text}
        </Text>
      </View>
    </View>
  );
};

export default Title;