import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import Text from '../Text';
import Title from '../Title';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <View className="w-full flex-1 items-center justify-center">
      <View className="mb-20 flex w-[80%] flex-col items-center">
        <View className="w-full">
          <Title text="Welcome into" />
        </View>
        <Text className="my-4 text-5xl tracking-widest text-[--accent]" black>
          LEVELITE
        </Text>

        <View className="mb-5 h-2 w-full bg-[--accent]" />

        <Text className="text-center text-[#B8B8B8]">
          Prepare to ascend both physically and mentally, forging unmatched strength, an unyielding
          mind, and unshakable discipline. Here, every completed task is a step closer to your next
          level.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onNext}
        className="absolute bottom-10 flex w-[80%] items-center rounded-lg bg-[--accent] p-3">
        <Text className="text-lg font-bold text-white">Next</Text>
      </TouchableOpacity>
    </View>
  );
};
