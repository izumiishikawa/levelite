import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';

interface HimariScreenProps {
  onNext: () => void;
}

const HimariScreen: React.FC<HimariScreenProps> = ({ onNext }) => {
  const [isGifCompleted, setIsGifCompleted] = useState(false);

  return (
    <View className="flex-1 w-full absolute h-full bg-black/90 justify-end items-center">
      <Image
        source={
          isGifCompleted
            ? require('../../assets/himaribig_static.png') // Imagem estática do último quadro do GIF
            : require('../../assets/himaribig.gif') // O GIF animado
        }
        className="absolute bottom-[-80px] w-[90%]"
        resizeMode="contain"
        onLoadEnd={() => {
          if (!isGifCompleted) {
            // Alterar para a imagem estática após a duração do GIF
            setTimeout(() => setIsGifCompleted(true), 3000); // Ajuste o tempo para a duração exata do GIF
          }
        }}
      />
      <TouchableOpacity
        className="mb-5 w-4/5 bg-[--accent] py-3 rounded-lg"
        onPress={onNext}
      >
        <Text className="text-white text-center font-bold text-lg">
          Okay, thank you!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HimariScreen;
