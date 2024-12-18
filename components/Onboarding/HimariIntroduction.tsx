import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';

interface HimariScreenProps {
  onNext: () => void;
}

const HimariScreen: React.FC<HimariScreenProps> = ({ onNext }) => {
  const [isGifCompleted, setIsGifCompleted] = useState(false);

  return (
    <View className="absolute h-full w-full flex-1 items-center justify-end bg-black/90">
      <Image
        resizeMethod="resize"
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
      <TouchableOpacity className="mb-5 w-4/5 rounded-lg bg-[--accent] py-3" onPress={onNext}>
        <Text className="text-center text-lg font-bold text-white">Okay, thank you!</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HimariScreen;
