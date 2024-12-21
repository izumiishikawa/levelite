import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import Title from './Title';
import AnimatedRollingNumbers from './AnimatedRolling';

const AttributeCircle: React.FC = () => {
  return (
    <View className="flex w-full flex-col items-center bg-[]">
      <View className="w-[80%]">
        <Title text="Attributes" />
      </View>

      <View className="relative mt-10 flex w-[90%] flex-col items-center justify-center gap-4">
        {/* Primeiro círculo (esquerda) */}
        <View
          style={{ width: 202, height: 202 }}
          className="relative flex items-center justify-center rounded-full bg-[--accent]">
          <View className="absolute top-4 flex rotate-6 flex-col items-center gap-0">
            
            <Text className="text-4xl text-white" black>
              Vitality
            </Text>
          <AnimatedRollingNumbers value={2} textColor="#fff" fontSize={100} />

          </View>
          <View className="absolute bottom-4 w-[110%] rotate-6 bg-[--foreground] px-4 py-2">
            <Text className="text-center text-lg text-white" bold>
              Normal
            </Text>
          </View>
        </View>

        {/* Segundo círculo (direita) */}
        <View
          style={{ width: 202, height: 202 }}
          className="relative flex items-center justify-center rounded-full bg-[--accent]">
          <View className="absolute top-4 flex rotate-6 flex-col items-center gap-0">
            
            <Text className="text-4xl text-white" black>
              Aura
            </Text>
          <AnimatedRollingNumbers value={8} textColor="#fff" fontSize={100} />

          </View>
          <View className="absolute bottom-4 w-[110%] rotate-6 bg-[--foreground] px-4 py-2">
            <Text className="text-center text-lg text-white" bold>
              Normal
            </Text>
          </View>
        </View>

        {/* Terceiro círculo (centro superior) */}
        <View
          style={{ width: 202, height: 202 }}
          className="relative flex items-center justify-center rounded-full bg-[--accent]">
          <View className="absolute top-4 flex rotate-6 flex-col items-center gap-0">
            
            <Text className="text-4xl text-white" black>
              Focus
            </Text>
          <AnimatedRollingNumbers value={18} textColor="#fff" fontSize={100} />

          </View>
          <View className="absolute bottom-4 w-[110%] rotate-6 bg-[--foreground] px-4 py-2">
            <Text className="text-center text-lg text-white" bold>
              Normal
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AttributeCircle;
